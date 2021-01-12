const Channels = require("../models/channels");
const Servers = require("../models/servers");
const Roles = require("../models/Roles");
const ServerMembers = require("../models/ServerMembers");
const redis = require("../redis");
//check if user is in the server.
module.exports = async (req, res, next) => {
  const serverID = req.params.server_id;
  const channelID = req.params.channel_id || req.params.channelID;

  


  // check if server is in cache
  const cacheServer = JSON.parse((await redis.getServer(serverID)).result || null);

  if (cacheServer) {
    // check if member is in cache
    const cacheMember = JSON.parse((await redis.getServerMember(req.user.uniqueID, serverID)).result || null);
    if (cacheMember) {
      req.permissions = cacheMember.permissions;
      req.server = cacheServer;
      if (channelID) {
        // check if channel is in cache
        const cacheChannel = JSON.parse((await redis.getServerChannel(channelID)).result || null);
        if (cacheChannel && cacheChannel.server_id && cacheChannel.server_id === serverID) {
          req.channel = cacheChannel;
          return next()
        }
      } else {
        return next();
      }
    }
  }





  const server = await Servers.findOne({ server_id: serverID }).select("+verified").lean();
  if (!server) {
    return res.status(404).json({
      message: "Server doesn't exist!"
    });
  }
  await redis.addServer(server.server_id, server);

  const member = await ServerMembers.findOne({
    server: server._id,
    member: req.user._id
  }, {_id: 0}).select('roles').lean();

  if (!member){
    return res.status(404).json({
      message: "Member doesn't exist in the server!"
    });
  }

  let permissions = 0;

  if (member.roles && member.roles.length) {
    const roles = await Roles.find({id: {$in: member.roles}}, {_id: 0}).select('permissions').lean();

    for (let index = 0; index < roles.length; index++) {
      const perm = roles[index].permissions;
      if (perm) {
        permissions = permissions | perm;
      }
    }
  }

  // add default role
  const defaultRole = await Roles.findOne({default: true, server: server._id}, {_id: 0}).select('permissions').lean();
  permissions = permissions| defaultRole.permissions;

  req.permissions = permissions;
  await redis.addServerMember(req.user.uniqueID, server.server_id, JSON.stringify({permissions}));
  

  if (channelID) {
    // check if channel exists in the server
    const channel = await Channels.findOne({server_id: serverID, channelID: channelID}).lean()
    if (!channel) {
      return res.status(404).json({
        message: "ChannelID is invalid or does not exist in the server."
      });
    }
    await redis.addChannel(channelID, Object.assign({}, channel, {server: undefined, server_id: server.server_id}), req.user.uniqueID );
    req.channel = channel;
  }

  // used to convert ObjectID to string
  req.server = JSON.parse(JSON.stringify(server));
  next();
};

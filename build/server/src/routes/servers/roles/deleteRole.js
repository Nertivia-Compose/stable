
const Roles = require('./../../../models/Roles');



module.exports = async (req, res, next) => {
  const roleID = req.params.role_id;


  // check if role exists.
  const role = await Roles.findOne({id: roleID, server: req.server._id});

  // check if default
  if (role.default) {
    return res
    .status(403)
    .json({ message: "Default role cannot be deleted." });
  }

  if (!role) {
    return res
    .status(404)
    .json({ message: "Role does not exist in that server." });
  }


  await Roles.deleteOne({_id: role._id});

  const io = req.io;
  io.in("server:" + req.server.server_id).emit("server:delete_role", {role_id: role.id, server_id: req.server.server_id});

  res.json({role_id: role.id, server_id: req.server.server_id});
  
};

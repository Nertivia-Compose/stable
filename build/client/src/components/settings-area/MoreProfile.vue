<template>
  <div class="content">
    <InformationTemplate
      class="desc"
      :title="$t('settings.account.more-profile')"
      :information="$t('settings.account.more-profile-notice')"
    />
    <div class="box">
      <CustomInput title="Name" v-model="name" prefixIcon="face" />
      <CustomDropDown
        title="Gender"
        :defaultId="gender"
        :items="genders"
        @change="gender = $event"
        IdPath="name"
      />
      <CustomDropDown
        title="Age"
        :defaultId="age"
        :items="ageGroups"
        @change="age = $event"
        IdPath="name"
      />

      <CustomDropDown
        title="Continent"
        :defaultId="continent"
        :items="continents"
        @change="continent = $event"
        IdPath="name"
      />
      <CustomDropDown
        title="Country"
        v-if="filteredCountries.length"
        :defaultId="country"
        :items="filteredCountries"
        @change="country = $event"
        IdPath="name"
      />
      <CustomInput
        title="Other"
        placeholder="I have 10 pretty cats."
        v-model="about_me"
        :textArea="true"
        prefixIcon="info"
      />
      <CustomButton
        :filled="true"
        :name="!saving ? $t('save-changes') : $t('saving')"
        icon="save"
        v-if="showSaveButton"
        @click="save"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import CustomInput from "@/components/CustomInput.vue";
import CustomButton from "@/components/CustomButton.vue";
import CustomDropDown from "@/components/CustomDropDown.vue";
import InformationTemplate from "@/components/InformationTemplate.vue";
import AvatarImage from "@/components/AvatarImage.vue";
import { ageGroups, continents, countries, genders } from "@/utils/surveyItems";
import { AboutMe, updateSurvay } from "@/services/userService";

@Component({
  components: {
    CustomInput,
    CustomButton,
    AvatarImage,
    InformationTemplate,
    CustomDropDown
  }
})
export default class MoreProfile extends Vue {
  @Prop() private aboutMe!: AboutMe;
  about_me = this.aboutMe?.about_me || "";
  name = this.aboutMe?.name || "";
  gender = this.aboutMe?.gender || "";
  age = this.aboutMe?.age || "";
  continent = this.aboutMe?.continent || "";
  country = this.aboutMe?.country || "";
  errors: any = {};
  genders = genders;
  ageGroups = ageGroups;
  continents = continents;
  countries = countries;
  saving = false;

  save() {
    if (this.saving) return;
    this.errors = false;
    this.saving = true;
    updateSurvay({
      about_me: this.about_me,
      age: this.age,
      continent: this.continent,
      country: this.country,
      gender: this.gender,
      name: this.name
    }).finally(() => {
      this.saving = false;
      this.$emit("update");
    });
  }

  get filteredCountries() {
    if (!this.continent || this.continent === "Rather not say") {
      return [];
    }
    const continent = continents.find(c => c.name === this.continent);
    if (!continent) return [];
    return countries.filter(c => c.code === continent.code || c.code === "no");
  }
  get showSaveButton() {
    if (this.name !== (this.aboutMe?.name || "")) return true;
    if (this.gender !== (this.aboutMe?.gender || "")) return true;
    if (this.age !== (this.aboutMe?.age || "")) return true;
    if (this.continent !== (this.aboutMe?.continent || "")) return true;
    if (this.country !== (this.aboutMe?.country || "")) return true;
    if (this.about_me !== (this.aboutMe?.about_me || "")) return true;
    return false;
  }
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.box {
  display: flex;
  flex-direction: column;
  padding: 10px;
  align-self: flex-start;
  margin-left: 5px;
}
.desc {
  margin-left: 10px;
  margin-top: 10px;
}
</style>

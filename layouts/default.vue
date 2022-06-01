<template>
  <v-app>
    <v-app-bar-title>
      <div class="text-center mt-8">
        <OpinioLogo dark size="lg"/>
      </div>
    </v-app-bar-title>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
      dark
    >
      <v-layout justify="center" align="center" v-if="!this.$vuetify.breakpoint.mobile">
        <v-col cols="2">
          <OpinioLogo size="md"/>
        </v-col>
        <v-col>
          <template>
            <v-dialog>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">Что означает эта страница?</div>
              </template>
              <AboutDialog/>
            </v-dialog>
          </template>
          <template>
            <v-dialog>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">Что такое Opinio?</div>
              </template>
              <AboutDialog/>
            </v-dialog>
          </template>
        </v-col>
        <v-col>
          <template>
            <v-dialog>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">Как мы проверяем отзывы?</div>
              </template>
              <AboutDialog/>
            </v-dialog>
          </template>
          <template>
            <v-dialog>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">Какие мессенджеры мы поддерживаем?</div>
              </template>
              <AboutDialog/>
            </v-dialog>
          </template>
        </v-col>
        <v-col cols="2">
          <div>Свяжитесь с нами:</div>
          <div>contact@opinio.space</div>
          <span>&copy; Opinio {{ new Date().getFullYear() }}</span>
        </v-col>
      </v-layout>
      <v-row justify="center" align="center" v-else>
        <v-row>
          <OpinioLogo size="md"/>
        </v-row>
        <v-row>
          <template>
            <v-dialog>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">Что означает эта страница?</div>
              </template>
              <AboutDialog/>
            </v-dialog>
          </template>
        </v-row>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import OpinioLogo from "@/components/OpinioLogo";
import AboutDialog from "@/components/AboutDialog";
export default {
  name: 'DefaultLayout',
  components: {AboutDialog, OpinioLogo},
  data () {
    return {
      fixed: false,
    }
  }
}
</script>

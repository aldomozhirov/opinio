<template>
  <v-row justify="center" align="center">
    <v-col cols="10">
      <v-row justify="center" align="center" class="my-10">
        <div class="text-h3 text-md-h2 text-center ma-auto">
          Эта страница подтверждает
        </div>
      </v-row>
      <v-row v-if="!loading">
        <v-row class="mx-md-15" justify="center">
          <v-col cols="7" md="auto" class="my-auto pr-0">
            <v-avatar size="65px">
              <img v-bind:src="review.sender.avatar" alt="avatar"/>
            </v-avatar>
            <v-avatar size="65px" style="{ position: absolute; left: -20px; }">
              <img v-bind:src="review.recipient.avatar" alt="avatar"/>
            </v-avatar>
          </v-col>
          <v-col class="pl-0 my-auto">
            <b>{{ review.sender.firstName }} {{ review.sender.lastName }}</b> отправил следующее сообщение пользователю <b>{{ review.recipient.firstName }} {{ review.recipient.lastName }}</b> через <b>Telegram</b>:
          </v-col>
        </v-row>
        <v-row>
          <v-card flat rounded="xl" outlined class="mt-5" color="#476A93">
            <v-card-text class="white--text">
              {{ review.text }}
            </v-card-text>
          </v-card>
          <div class="text-right align-content-end ml-auto">Отправлено {{ dateString }}</div>
        </v-row>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {Route} from 'vue-router'
import moment from 'moment';

import Vue from 'vue'

class VueWithRoute extends Vue {
  $route: Route
}

export default VueWithRoute.extend({
  data () {
    return {
      loading: true,
      review: {}
    }
  },
  computed: {
    dateString(): string {
      const review: any = this.review;
      const sentAt = review.sentAt;
      moment.locale('ru');
      return moment.unix(sentAt).format('DD.MM.YYYY в H:mm');
    }
  },
  async created () {
    this.loading = true;
    const resp = await fetch(`/api/reviews/${this.$route.params.verification}`);
    this.review = await resp.json();
    this.loading = false;
  }
})
</script>

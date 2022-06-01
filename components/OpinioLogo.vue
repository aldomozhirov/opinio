<template>
  <img
    alt="Opinio Logo"
    :class="sizeClassName"
    :src="dark ? '/opinio-logo-dark.svg' : '/opinio-logo-light.svg'"
  >
</template>

<style>
.opinio-logo-sm {
  height: 20px;
}
.opinio-logo-md {
  height: 40px;
}
.opinio-logo-lg {
  height: 60px;
}
</style>

<script lang="ts">

import Vue from 'vue'

export default Vue.extend({
  props: {
    dark: Boolean,
    size: String
  },
  computed: {
    sizeClassName(): string {
      return `opinio-logo-${this.$props.size}`
    }
  }
})
</script>

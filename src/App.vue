<template>
  <v-app dark >
    <v-app-bar
      app
      color="primary"
      dark
    >
      

      <v-spacer></v-spacer>


    </v-app-bar>

    <v-content>
      <div class="container">
        <router-view/>
      </div>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: 'App',
};
</script>

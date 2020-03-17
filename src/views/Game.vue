<template>
  <div class="game">
    <v-row v-if="loading" class="justify-center">
      <v-progress-circular :size="250" :width="20" color="primary" indeterminate></v-progress-circular>
    </v-row>
    <v-alert v-else-if="error" type="error">
      {{error.text}}
    </v-alert>
    <div v-else>
      <v-card color="grey lighten-4" flat :dark="true">
        <v-toolbar color="secondary">
          <v-toolbar-title>{{game.name}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn v-if="game.canEdit" @click="next()" color="success">
            <v-icon left>mdi-flag-checkered</v-icon> Далее
          </v-btn>
        </v-toolbar>
      </v-card>
      <v-card class="pa-3" v-if="game.stateData">
        <v-alert type="info" class="mb-0">
          {{game.stateData.message}}
        </v-alert>
      </v-card>
      <v-card class="pa-3" v-if="users">
        <v-card v-if="users && users.host" class="primary text-center pa-3" :style="{opacity: users.host.isConnected ? 1 : .5}">
          <v-icon size="5em" dark>mdi-shield-account</v-icon>
          <v-card-title class="white--text justify-center">Ведущий</v-card-title>
          <v-card-text class="white--text pb-0" v-if="!users.host.isConnected">Не подключен</v-card-text>
        </v-card>

        <v-row>
          <v-col cols="4"  :key="'game_'+$index" v-for="(user, $index) in users.list">
            <v-card class="text-center pa-3" :class="{'card--me': game.yourId === user.id}" :style="{opacity: user.isConnected ? 1 : .5}">
              <v-icon size="5em">{{getRoleIcon(roles[user.id])}}</v-icon>
              <v-card-title class="justify-center">{{user.name}} <span class="font-weight-light" v-if="game.yourId === user.id"> (вы)</span></v-card-title>
              <v-card-text class="title">{{getRoleName(roles[user.id])}}</v-card-text>
              <v-card-text class="pb-0" v-if="!user.isConnected">Не подключен</v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-card>
    </div>
  </div>
</template>
<style lang="scss">
  .card--me {
    box-shadow: 0 0 1em #2196f3;
  }
</style>
<script>
  import { Games } from '@/api';
  export default  {
    sockets: {
      roles(data) {
        console.log('roles', data);
        Object.keys(data).forEach(userId => {
          this.$set(this.roles, userId, data[userId]);
        })
      },
      state(stateData) {
        this.$set(this.game, 'stateData', stateData);
      },
      disconnect({id}) {
        this.users.list.forEach(user => {
          if (user.id === id) {
            user.isConnected = false;
          }
        })
      },
      users(usersList) {
        this.users = usersList;
      }
    },
    methods: {
      getRoleIcon(role) {
        let icon = "";
        switch (role) {
          case "CIVILIAN":
            icon = "mdi-account";
            break;
          case "MAFIA":
            icon = "mdi-incognito";
            break;
          case "HOST":
            icon = "mdi-microphone";
            break;
          case "UNKNOWN":
          default:
            icon = "mdi-account-question";
            break;
        }
        return icon;
      },
      getRoleName(role) {
        let name = "";
        switch (role) {
          case "CIVILIAN":
            name = "Мирный житель";
            break;
          case "MAFIA":
            name = "Мафия";
            break;
          case "HOST":
            name = "Ведущий";
            break;
          case "UNKNOWN":
          default:
            name = "";
            break;
        }
        return name;
      },
      next() {
        Games.next(this.game.id).then(res => {

        }).catch(e => {

        })
      }
    },
    data() {
      return {
        loading: true,
        game: null,
        error: null,
        users: {},
        roles: {}
      }
    },
    async mounted() {
      //let game = this.$route.params.game;
      let game = null;
      if (!game) {
        try {
          game = await Games.getById(this.$route.params.id);
        } catch (e) {
          this.error = e;
        }
      }
      this.game = game;
      this.loading = false;
    }
  }
</script>

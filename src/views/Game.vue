<template>
  <div class="game__inner">
    <v-row v-if="loading" class="justify-center">
      <v-progress-circular :size="250" :width="20" color="white" indeterminate></v-progress-circular>
    </v-row>
    <div class="game__name" v-if="game">
      {{game.name}}
    </div>
    <v-btn class="game__button game__button--go-next" outlined x-large v-if="youAreHost" @click="next()" color="white">
      <v-icon left>mdi-flag-checkered</v-icon> Далее
    </v-btn>
    <v-alert v-if="error" type="error">
      {{error.text}}
    </v-alert>

    <div v-if="!loading && !error">
      <div class="game__message">
        <transition name="fade">
          <div class="game__message__inner" :key="game.stateData.stateName">
            {{game.stateData.message}}
          </div>
        </transition>
      </div>

      <div class="game__overlay" v-if="game && game.stateData && game.stateData.stateName === 'STATE_GREETING' && yourRole">
        <div class="game__overlay__inner">
          <div class="game__overlay__title">
            Ваша роль - {{getRoleName(yourRole)}}
          </div>
          <div class="game__overlay__user-container">
            <v-card class="game__user game__user--overlay" :style="{backgroundImage: `url(${getCardBackgroundByRole(yourRole)}`}">
              <div class="game__user__inner">
                <v-icon size="5em">{{getRoleIcon(yourRole)}}</v-icon>
                <v-card-text class="game__user__role-name">{{getRoleName(yourRole)}}</v-card-text>
              </div>
            </v-card>
          </div>
        </div>
      </div>

      <div class="game__overlay" v-if="game && game.stateData && game.stateData.stateName === 'STATE_MAFIA_GREETING' && (yourRole === 'MAFIA' || yourRole === 'MAFIA_BOSS') ">
        <div class="game__overlay__inner">
          <div class="game__overlay__title">
            Список мафиози
          </div>
          <div class="game__overlay__users-list">
            <div class="game__overlay__user-container">
              <v-card class="game__user game__user--overlay" :style="{backgroundImage: `url(${getCardBackground(user)}`}" :key="$index" v-for="(user, $index) in getUsersByRoles(['MAFIA', 'MAFIA_BOSS'])">
                <div class="game__user__inner">
                  <v-card-title class="justify-center game__user__name">{{user.name}} <span class="font-weight-light" v-if="game.yourId === user.id"> (вы)</span></v-card-title>
                  <v-icon size="5em">{{getRoleIcon(roles[user.id])}}</v-icon>
                  <v-card-text class="game__user__role-name">{{getRoleName(roles[user.id])}}</v-card-text>
                </div>
              </v-card>
            </div>
          </div>
        </div>
      </div>


      <v-alert  color="#2A3B4D" dark class="ma-3 " v-if="nightResults">
        {{getNightKilled}}
      </v-alert>

      <v-alert  color="#f00" dark class="ma-3" v-if="votingResults">
      {{getName(votingResults.user)}} отправляется за решетку. Его роль - {{getRoleName(votingResults.role)}}
      </v-alert>

      <v-card class="pa-3 game__users" v-if="users">
        <v-card style="display:none" v-if="users && users.host" class="primary text-center pa-3" :style="{opacity: users.host.isConnected ? 1 : .5}">
          <v-icon size="5em" dark>mdi-shield-account</v-icon>
          <v-card-title class="white--text justify-center">Ведущий</v-card-title>
          <v-card-text class="white--text pb-0" v-if="!users.host.isConnected">Не подключен</v-card-text>
        </v-card>
        <div v-if="poll">
          <div class="red--text text-center py-5 game__poll-title">{{poll.title}}</div>
          <div v-if="youAreHost" class="text-center py-3 white--text">Если по каким-то причинам игроки не могут проголосовать, вы можете это сделать за них</div>
        </div>
        <div class="text-center white--text" v-if="users.list && users.list.length === 0">Пока что никто не присоединился</div>
        <v-row class="game__users__inner" >
          <v-col class="game__user-container" :key="'game_'+$index" v-for="(user, $index) in users.list">
            <v-card @click="onUserSelect(user)" class="game__user" :style="{backgroundImage: `url(${getCardBackground(user)}`}" :class="{'game__user--unknown': !roles[user.id], 'game__user--me': game.yourId === user.id,'game__user--poll-not-available': poll && !isAvailableForPoll(user), 'game__user--poll-available': isAvailableForPoll(user)}">
              <div class="game__user__killed" v-if="user.state === 'STATE_KILLED'"></div>
              <div class="game__user__inner">
                <v-icon size="5em" v-if="roles[user.id]">{{getRoleIcon(roles[user.id])}}</v-icon>
                <v-card-title class="justify-center game__user__name">{{user.name}} <span class="font-weight-light" v-if="game.yourId === user.id"> (вы)</span></v-card-title>
                <v-card-text class="game__user__role-name" v-if="roles[user.id]">{{getRoleName(roles[user.id])}}</v-card-text>
                <v-card-text class="game__user__not-connected" v-if="!user.isConnected">
                  <v-icon size="1em" class="mr-1 white--text">mdi-alert</v-icon>
                  Не подключен
                </v-card-text>
                <v-card-text class="game__user__poll-results" v-if="poll && getPollResults(user).length > 0">
                  <div class="game__user__poll-results__item" :key="$index" v-for="(result, $index) in getPollResults(user)">
                    {{result}}
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-col>
        </v-row>

      </v-card>
    </div>
  </div>
</template>
<style lang="scss">

</style>
<script>
  import { Games } from '@/api';
  export default  {
    computed: {
      yourRole() {
        let yourId = this.game.yourId;
        return this.roles[yourId] ? this.roles[yourId] : '';
      },
      getNightKilled() {
        if (this.nightResults.killed && this.nightResults.killed.length === 0) {
          return "Удача! Никто не был убит этой ночью";
        } else {
          return `Сегодня ночью были убиты:  ${this.nightResults.killed.map(userId => this.getName(userId)).join(', ')}`;
        }
      },
      youAreHost() {
        return this.game && this.game.canEdit;
      }
    },
    sockets: {
      voting_results(data) {
        this.nightResults = null;
        this.votingResults = data;
        if (!this.users.list) {
          return;
        }
        let user = this.users.list.filter(user => user.id === data.user)[0];
        if (user) {
          user.state = "STATE_KILLED";
        }
      },
      night_results(data) {
        this.votingResults = null;
        this.nightResults = data;
      },
      poll_results(data) {
        if (this.poll) {
          this.$set(this.poll, 'results', data);
        }
      },
      poll(data) {
        this.poll = data;
      },
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
      getUsersByRoles(roles) {
        return this.users.list ? this.users.list.filter(user => roles.indexOf(this.roles[user.id]) !== -1) : [];
      },
      getCardBackgroundByRole(role) {
        if (!role || role === "UNKNOWN") {
          return '/img/card-question.png';
        }
        if (role === "CIVILIAN") {
          return '/img/card-blue.png';
        }
        if (role === "MAFIA" || role === "MAFIA_BOSS") {
          return '/img/card-black.png';
        }
        return '/img/card-red.png';
      },
      getCardBackground(user) {
        let roles = this.roles;
        return this.getCardBackgroundByRole(roles[user.id]);
      },
      getName(userId) {
        let name = "";
        this.users.list.forEach(user => {
          if (user.id === userId) {
            name = user.name;
          }
        })
        return name;
      },
      getPollResults(user) {
        let results = [];
        Object.keys(this.poll.results).forEach(fromUser => {
          if (this.poll.results[fromUser] === user.id) {
            results.push(this.getName(fromUser));
          }
        })
        return results;
      },
      onUserSelect(user) {
        if (this.poll && this.isAvailableForPoll(user)) {
          Games.sendPollResults(this.game.id, {id: user.id}).then(res => {}).catch(e => {})
        }
      },
      isAvailableForPoll(user) {
        if (!this.poll) {
          return false;
        }
        return this.poll.variants.indexOf(user.id) !== -1 && user.id !== this.game.yourId;
      },
      getRoleIcon(role) {
        let icon = "";
        switch (role) {
          case "CIVILIAN":
            icon = "mdi-account";
            break;
          case "MAFIA":
            icon = "mdi-incognito";
            break;
          case "MAFIA_BOSS":
            icon = "mdi-sunglasses";
            break;
          case "HOST":
            icon = "mdi-microphone";
            break;
          case "DOCTOR":
            icon = "mdi-doctor";
            break;
          case "DETECTIVE":
            icon = "mdi-magnify-plus-outline";
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
          case "MAFIA_BOSS":
            name = "Мафия (босс)";
            break;
          case "HOST":
            name = "Ведущий";
            break;
          case "UNKNOWN":
          default:
            name = "???";
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
        roles: {},
        poll: null,
        nightResults: null,
        votingResults: null
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

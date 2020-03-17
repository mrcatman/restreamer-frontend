<template>
  <div class="home">
    <v-row>
      <v-col>
        <v-card color="grey lighten-4" flat :dark="true">
          <v-toolbar color="secondary">
            <v-toolbar-title>Список доступных игр</v-toolbar-title>
            <v-spacer></v-spacer>
			<GameFormOpener @add="onNewGame"/>
          </v-toolbar>
        </v-card>
        <v-card>
         <v-list-item  @click="joinGame(item)" v-if="!loading" :key="'game_'+$index" v-for="(item, $index) in games">
            <v-list-item-content>
              <v-list-item-title v-text="item.name"></v-list-item-title>
              <v-list-item-subtitle v-text="`${item.totalUsersCount} игроков (подключено: ${item.connectedUsersCount})`"></v-list-item-subtitle>
            </v-list-item-content>
             <!--
            <v-list-item-action>
              <v-btn>
                Присоединиться
              </v-btn>
            </v-list-item-action>
            -->
          </v-list-item>
        </v-card>
        <v-skeleton-loader v-if="loading" v-for="$i in 5" :key="'loading_'+$i" type="list-item" class="mx-auto"></v-skeleton-loader>
      </v-col>
    </v-row>

    <GameJoin :game="selectedGame"/>
  </div>
</template>
<script>
import { Games } from '@/api';
import GameFormOpener from '@/components/GameFormOpener';
import GameJoin from '@/components/GameJoin';
export default {
	name: 'Home',
    methods: {
	    joinGame(game) {
	        if (game.isMember) {
                this.$router.push({name: `Game`, params: {game, id: game.id}});
            } else {
                this.selectedGame = game;
            }
        },
        onNewGame(game) {
            this.games.unshift(game);
        }
    },
	data() {
		return {
            selectedGame: null,
			loading: true,
			games: []
		}
	},
	async mounted() {
		this.games = await Games.get();
		this.loading = false;
	},
	components: {
        GameJoin,
		GameFormOpener
	}
}
</script>

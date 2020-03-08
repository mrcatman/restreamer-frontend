<template>
  <div class="home">
    <v-row>
      <v-col>
        <v-card color="grey lighten-4" flat :dark="true">
          <v-toolbar color="secondary">
            <v-toolbar-title>Список доступных игр</v-toolbar-title>
            <v-spacer></v-spacer>      
			<GameFormOpener/>
          </v-toolbar>
        </v-card>
        <v-card>
          <v-skeleton-loader v-if="loading" v-for="$i in 5" :key="$i" type="list-item" class="mx-auto"></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

  </div>
</template>
<script>
import { Games } from '@/api';
import GameFormOpener from '@/components/GameFormOpener';
export default {
	name: 'Home',
	data() {
		return {
			loading: true,
			games: []
		}
	},
	async mounted() {
		this.games = await Games.get();
		this.loading = false;
	},
	components: {
		GameFormOpener
	}
}
</script>

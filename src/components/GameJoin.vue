<template>
<v-dialog v-model="opened"  max-width="600px">
	<v-card v-if="game">
		<v-card-title>
		 	<span class="headline">Присоединиться к игре</span>
		</v-card-title>
		<v-card-text>
		  <v-container>
			  <v-text-field v-model="data.name" label="Ваше имя*" required :error-messages="errors.name"></v-text-field>
			  <v-text-field type="password" label="Пароль для входа в игру" v-show="game.usePassword" v-model="data.password" :error-messages="errors.password"></v-text-field>
			  <v-card-actions>
				  <v-btn color="blue" @click="join" :loading="loading">Присоединиться</v-btn>
				  <v-btn color="blue darken-1" text @click="opened = false">Отмена</v-btn>
			  </v-card-actions>
			</v-container>
		</v-card-text>
	</v-card>
</v-dialog>
</template>
<script>
import { Games } from '@/api';
export default {
	props: {
		game: {
			type: Object,
			required: false
		}
	},
	watch: {
		game (newGame) {
			this.opened = true;
		}
	},
	methods: {
		join() {
			this.loading = true;
			Games.join(this.game.id, this.data).then(res => {
				this.$router.push({name: `Game`, params: {game: this.game, id: this.game.id}});
				this.loading = false;
				this.opened = false;
			}).catch(e => {
				this.loading = false;
				this.errors = e.errors;
			})
		}
	},
	data(){
		return {
			loading: false,
			opened: false,
			errors: {},
			data: {
				name: '',
			}
		}
	}
}
</script>

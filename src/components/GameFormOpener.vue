<template>
<v-dialog v-model="opened"  max-width="600px">
	<template v-slot:activator="{ on }">
		<v-btn v-on="on" color="success">
		  <v-icon left>mdi-plus</v-icon> Создать новую
		</v-btn>
	</template>
	<v-card>
		<v-card-title>
		  <span class="headline">Создать новую игру</span>
		</v-card-title>
		<v-card-text>
		  <v-container>
			  <v-text-field v-model="data.name" label="Название*" required :error-messages="errors.name"></v-text-field>
			  <v-switch v-model="data.usePassword" label="Использовать пароль на вход" :error-messages="errors.usePassword"></v-switch>
			  <v-text-field type="password" label="Пароль" v-show="data.usePassword" v-model="data.password" :error-messages="errors.password"></v-text-field>

			  <v-card-actions>
				  <v-btn color="blue" @click="save" :loading="loading">Добавить игру</v-btn>
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
	methods: {
		save() {
			this.loading = true;
			Games.add(this.data).then(res => {
				this.$emit('add', res);
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
				usePassword: false,
				password: ''
			}
		}
	}
}
</script>

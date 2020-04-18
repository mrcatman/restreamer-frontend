<template>
<v-dialog v-model="opened"  max-width="600px">
	<template v-slot:activator="{ on }">
		<v-btn @click="setDefaultData()" v-on="on" color="success">
		  <v-icon left>mdi-plus</v-icon> Создать новую
		</v-btn>
	</template>
	<v-card>
		<v-card-title>
		  <span class="headline">{{data.id ? "Редактировать задачу" : "Создать новую задачу"}}</span>
		</v-card-title>
		<v-card-text>
		  <v-container v-if="visible">
			  <v-text-field v-model="data.name" label="Название" :error-messages="errors.name"></v-text-field>
			  <v-switch v-model="data.needRecord" label="Записывать в файл" :error-messages="errors.needRecord"></v-switch>
			  <v-text-field v-model="data.url" label="URL потока*" required :error-messages="errors.url"></v-text-field>
			  <v-input label="Время начала" :error-messages="errors.startTime">
				  <datetime format="DD/MM/YYYY H:i" v-model="data.startTime"></datetime>
			  </v-input>
			  <v-input label="Время окончания" :error-messages="errors.endTime">
				  <datetime format="DD/MM/YYYY H:i" v-model="data.endTime"></datetime>
			  </v-input>

			  <v-card outlined class="mx-auto mb-3 pa-3">
				  <v-row v-for="(endpoint, $index) in data.endpoints" :key="$index">
					  <v-col cols="9">
						  <v-text-field label="URL рестрима" v-model="data.endpoints[$index].url" :error-messages="errors['endpoints_' + $index]"></v-text-field>
					  </v-col>
					  <v-col cols="3">
						  <v-btn color="red" @click="data.endpoints.splice($index, 1)">Удалить</v-btn>
					  </v-col>
				  </v-row>
				  <v-btn color="green" @click="data.endpoints.push({url: ''})">Добавить еще адрес</v-btn>
			  </v-card>

			  <v-card-actions>
				  <v-btn color="blue" @click="save" :loading="loading">Сохранить</v-btn>
				  <v-btn color="blue darken-1" text @click="opened = false">Отмена</v-btn>
				</v-card-actions>
			</v-container>
		</v-card-text>
	</v-card>
</v-dialog>
</template>
<script>
import { Tasks } from '@/api';
import datetime from 'vuejs-datetimepicker';
export default {
	components: {
		datetime
	},
	methods: {
		setDefaultData() {
			this.visible = false;
			this.data = {
				name: '',
				needRecord: false,
				url: '',
				endpoints: [
					{url: ''}
				],
				startTime: null,
				endTime: null
			};
			this.$nextTick(() => {
				this.visible = true;
			})
		},
		openForm(item) {
			let data = JSON.parse(JSON.stringify(item));
			//data.endpoints = data.endpoints.map(endpoint => endpoint.url);
			data.startTime = this.formatDate(data.startTime);
			if (data.endTime && data.endTime !== '') {
				data.endTime = this.formatDate(data.endTime);
			}
			this.data = data;
			this.opened = true;
		},
		save() {
			this.loading = true;
			Tasks.add(this.data).then(res => {
				if (res.is_new) {
					this.$emit('add', res);
				} else {
					this.$emit('edit', res);
				}
				this.loading = false;
				this.opened = false;
			}).catch(e => {
				this.loading = false;
				this.errors = e.errors;
			})
		},
		formatDate(string) {
			let date = new Date(string);
			return `${date.getDate().toString().padStart(2, 0)}/${(date.getMonth() + 1).toString().padStart(2, 0)}/${date.getFullYear()} ${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}`
		}
	},
	data(){
		return {
			loading: false,
			opened: false,
			errors: {},
			data: {
				name: '',
				needRecord: false,
				url: '',
				endpoints: [
					{url: ''}
				],
				startTime: null,
				endTime: null
			},
			visible: true
		}
	}
}
</script>

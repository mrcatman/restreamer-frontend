<template>
  <div class="home">
    <div class="container">

      <v-snackbar :multi-line="true" v-model="snackbar.error.visible" :bottom="true" color="red" :timeout="15000">
        {{ snackbar.error.text }}
        <v-btn dark text @click="snackbar.error.visible = false">Закрыть</v-btn>
      </v-snackbar>

      <v-dialog v-model="log.visible" width="640px">

        <v-card>
          <v-card-title class="headline" primary-title>Лог</v-card-title>
          <v-card-text class="mt-3">
            <div v-for="(row, $index) in log.text" :key="$index">
              {{row}}
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="log.visible = false">Закрыть</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-row>
        <v-col>
          <v-card color="grey lighten-4" flat :dark="true">
            <v-toolbar color="secondary">
              <v-toolbar-title>Список задач</v-toolbar-title>
              <v-spacer></v-spacer>
              <TaskFormOpener ref="opener" @add="onNewTask" @edit="onTaskEdit"/>
            </v-toolbar>
          </v-card>
          <v-card>
            <div :key="'task_'+$index" v-for="(item, $index) in tasks">
              <v-list-item >
                <v-list-item-content>
                  <v-list-item-title class="headline mb-1" v-text="item.name"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.url"></v-list-item-subtitle>
                  <v-list-item-subtitle v-text="getStartTime(item)"></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-row>
                    <v-col>
                      <v-btn color="black" class="white--text" @click="toggle(item)">Статус задач</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn color="blue" @click="open(item)">Редактировать</v-btn>
                    </v-col>
                  </v-row>
                </v-list-item-action>
              </v-list-item>
              <v-card outlined class=" lighten-1" v-show="toggled[item.id]">
                <div class="preloader-container" v-show="item._loading">
                  <v-progress-circular :size="110" :width="7" indeterminate></v-progress-circular>
                </div>

                <v-list-item>
                  <v-list-item-content>
                    <div class="overline">Задачи</div>
                 </v-list-item-content>
                </v-list-item>

                <v-list-item two-line v-for="(endpoint, $endpointIndex) in item.endpoints" :key="$endpointIndex">
                  <v-list-item-content >
                    <v-list-item-title class="body-2">{{endpoint.url}}</v-list-item-title>
                    <v-list-item-title class="body-1 font-weight-bold" :class="{'red--text': endpoint.state === 'STATE_ERROR'}">Статус: {{getStateName(endpoint.state)}}</v-list-item-title>

                  </v-list-item-content>
                  <v-list-item-action>
                    <v-row>
                      <v-col>
                        <v-btn text @click="showLog(endpoint.id)">Лог</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn color="green" @click="startEndpoint(item, endpoint)">Запустить</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn color="red" @click="stopEndpoint(item, endpoint)">Остановить</v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item two-line v-if="item.needRecord">
                  <v-list-item-content >
                    <v-list-item-title class="body-2">Запись в файл</v-list-item-title>
                    <v-list-item-title class="body-1 font-weight-bold" :class="{'red--text': item.recordState === 'STATE_ERROR'}">Статус: {{getStateName(item.recordState)}}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-row>
                      <v-col>
                        <v-btn text @click="showLog('record_' + item.id)">Лог</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn color="green" @click="startRecord(item)">Запустить</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn color="red" @click="stopRecord(item)">Остановить</v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-action>
                </v-list-item>

                <v-card-actions>

                </v-card-actions>
              </v-card>
            </div>
          </v-card>
          <v-skeleton-loader v-if="loading" v-for="$i in 5" :key="'loading_'+$i" type="list-item" class="mx-auto"></v-skeleton-loader>
        </v-col>
      </v-row>

    </div>
  </div>

</template>
<script>
import { Tasks } from '@/api';
import TaskFormOpener from '@/components/TaskFormOpener';

export default {
	name: 'Home',
    sockets: {
        ffmpeg_error(data) {
            console.log(data);
            this.snackbar.error.text = "Ошибка: "+(data.output.join('\n'));
            this.snackbar.error.visible = true;
            this.tasks.forEach(task => {
              if (task.id === data.taskId) {
                task.endpoints.forEach(endpoint => {
                  if (endpoint.id === data.endpointId) {
                    endpoint.status = "STATE_ERROR";
                    this.$set(endpoint, 'log', data.output);
                  }
                })
              }
            })
        },
    },
    methods: {
        async showLog(logId) {
            Tasks.getLog(logId).then(res => {
                this.log.text = res;
                this.log.visible = true;
            }).catch(e => {

            })
        },
	    async reload() {
	        this.loading = true;
            this.tasks = await Tasks.get();
            this.loading = false;
        },
        stopEndpoint(item, endpoint) {
            this.$set(item, '_loading', true);
            Tasks.startEndpoint(item, endpoint).then(res => {item._loading = false;this.reload();}).catch(e => {item._loading = false;})
        },
        startEndpoint(item, endpoint) {
            this.$set(item, '_loading', true);
            Tasks.startEndpoint(item, endpoint).then(res => {item._loading = false;this.reload();}).catch(e => {item._loading = false;})
        },
        stopRecord(item) {
            this.$set(item, '_loading', true);
            Tasks.stopRecord(item).then(res => {item._loading = false;this.reload();}).catch(e => {item._loading = false;})
        },
        startRecord(item) {
            this.$set(item, '_loading', true);
            Tasks.startRecord(item).then(res => {item._loading = false;this.reload();}).catch(e => {item._loading = false;})
        },
        toggle(item) {
            this.$set(this.toggled, item.id, !this.toggled[item.id]);
        },
        getStateName(state) {
            if (state === 'STATE_ERROR') {
                return 'Ошибка!';
            }
            if (state === 'STATE_NOT_STARTED') {
                return 'Не начато';
            }
            if (state === 'STATE_STARTED') {
                return 'Работает';
            }
            if (state === 'STATE_ENDED') {
                return 'Закончился';
            }
            return '';
        },
        open(item) {
            this.$refs.opener.openForm(item);
        },
        getStartTime(item) {
            return new Date(item.startTime).toLocaleString();
        },
        onTaskEdit(task) {
            this.tasks.forEach((item, index) => {
                if (item.id === task.id) {
                    this.$set(this.tasks, index, task);
               }
            })
        },
        onNewTask(Task) {
            this.tasks.unshift(Task);
        }
    },
	data() {
		return {
            selectedTask: null,
			loading: true,
			tasks: [],
            toggled: {},
            log: {
                text: '',
                visible: false
            },
            snackbar: {
                error: {
                    visible: false,
                    text: ''
                }
            }
		}
	},
	async mounted() {
		this.tasks = await Tasks.get();
		this.loading = false;
	},
	components: {
      TaskFormOpener
	}
}
</script>

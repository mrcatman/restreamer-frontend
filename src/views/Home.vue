<template>
  <div class="home">
    <v-row>
      <v-col

      >
        <v-card color="grey lighten-4" flat>
          <v-toolbar color="secondary" :dark="true">
            <v-toolbar-title>Список доступных игр</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn color="success">
              <v-icon left>mdi-plus</v-icon> Создать новую
            </v-btn>
          </v-toolbar>
        </v-card>
        <v-card>
          <v-skeleton-loader v-for="$i in 5" :key="$i" type="list-item" class="mx-auto"></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  }
}
</script>

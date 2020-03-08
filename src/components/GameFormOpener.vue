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
			<v-text-field label="Название*" required></v-text-field>
			<v-text-field label="" hint="example of persistent helper text" persistent-hint required></v-text-field>
				<v-card-actions>
				  <v-spacer></v-spacer>
				  <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
				  <v-btn color="blue darken-1" text @click="dialog = false">Save</v-btn>
				</v-card-actions>
			</v-container>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>
<script>
export default {
	data(){ 
		return {
			opened: false
		}
	}
}
</script>
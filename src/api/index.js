const BASE_URL = "http://localhost:8082/";
import Swal from 'sweetalert2/dist/sweetalert2.js'

const getRequest = (url, data = null, showErrors = false) => {
	return new Promise((resolve, reject) => {
		let fetchData = {
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		};
		if (data) {
			fetchData.body = JSON.stringify(data)
		}
		fetch(BASE_URL + url, {
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		}).then(async response => {
			let jsonResponse = await response.json();
			if (response.status >= 400) {
				if (showErrors) {
					Swal.fire({
						title: 'Ошибка!',
						text: jsonResponse.error
					})
				}
				reject(jsonResponse);
			} else {
				resolve(jsonResponse);
			}
		}).catch(e => {
			Swal.fire({
				title: 'Ошибка!',
				text: e.message
			})
			reject();
		});
	})
}

const postRequest = (url, data = null, showErrors = false) => {
	return new Promise((resolve, reject) => {
		let fetchData = {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		};
		if (data) {
			fetchData.body = JSON.stringify(data)
		}
		fetch(BASE_URL + url, fetchData).then(async response => {
			let jsonResponse = await response.json();
			if (response.status >= 400) {
				if (showErrors) {
					Swal.fire({
						title: 'Ошибка!',
						text: jsonResponse.error
					})
				}
				reject(jsonResponse);
			} else {
				resolve(jsonResponse);
			}
		}).catch(e => {
			Swal.fire({
				title: 'Ошибка!',
				text: e.message
			})
			reject();
		});
	})
}

const Tasks = {
	getLog: (logId) => getRequest('tasks/log/'+logId),
	get: () => getRequest('tasks'),
	add: (data) => postRequest('tasks', data),
	startRecord: (task) => postRequest('tasks/'+task.id+'/start/record', {}, true),
	stopRecord: (task) => postRequest('tasks/'+task.id+'/stop/record', {}, true),
	startAll: (task) => postRequest('tasks/'+task.id+'/start-all', {}, true),
	stopAll: (task) => postRequest('tasks/'+task.id+'/stop-all', {}, true),
	startEndpoint: (task, endpoint) => postRequest('tasks/'+task.id+'/start/' + endpoint.id, {}, true),
	stopEndpoint: (task, endpoint) => postRequest('tasks/'+task.id+'/stop/' + endpoint.id, {}, true),
}

export {
	Tasks
}

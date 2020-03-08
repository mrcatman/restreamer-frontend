const BASE_URL = "http://localhost:8080/";

const getRequest = (url) => {
	console.log(BASE_URL + url);
	return fetch(BASE_URL + url).then(res => res.json());
}

const Games = {
	get: () => getRequest('games')
}

export {
	Games
}
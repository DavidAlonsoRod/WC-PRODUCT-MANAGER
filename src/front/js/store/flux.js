const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			auth: false
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},
			logout: () => {
				console.log('logout desde flux')
				localStorage.removeItem("token");
				setStore({
					auth: false,
					customer: null
				});
			},
			handleLogout: () => {

				localStorage.removeItem("token");
				setStore({ auth: false })
			},
			login: (email, password) => {

				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(
						{
							"email": email,
							"password": password
						}
					)
				};

				fetch(`${process.env.BACKEND_URL}/api/login`, requestOptions)
					.then(response => {
						if (response.ok) {
							setStore({ auth: true });
							return response.json();
						} else {
							throw new Error("Login failed");
						}
					})
					.then(data => {
						localStorage.setItem("token", data.access_token);
						setStore({
							auth: true,
							customer: {
								email: data.email,
								username: data.username, // Asegúrate de que tu API devuelva estos datos
								first_name: data.first_name,
								last_name: data.last_name
							}
						});
					})
					.catch(error => {
						console.error("Error during login:", error);
					});


			},

			getMessage: async () => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},
			getOrders: async () => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/orders`);
					if (response.ok) {
						const data = await response.json();
						setStore({ orders: data }); // Guardar órdenes en el store
					} else {
						throw new Error("Failed to fetch orders");
					}
				} catch (error) {
					console.error("Error fetching orders:", error);
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;
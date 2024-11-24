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
			auth: false,
			customers: [],
			totalCustomers: 0 
		},
		actions: {
			
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},
			logout: () => {
				setStore({ auth: false });
				localStorage.removeItem("token");
			},

			handleLogout: () => {

				localStorage.removeItem("token");
				setStore({ auth: false })
			},
			login: async (email, password) => {
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password })
				};

				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/login`, requestOptions);
					if (response.ok) {
						const data = await response.json();
						localStorage.setItem("token", data.access_token);
						setStore({ auth: true });
						return response; 
					} else {
						throw new Error("Login failed");
					}
				} catch (error) {
					console.error("Error during login:", error);
					return { ok: false }; 
				}
			},
			
			verifyToken: async () => {
				const token = localStorage.getItem("token");

				if (!token) {
					setStore({ auth: false });
					return false;
				}

				const requestOptions = {
					method: 'GET',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				};

				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/privatepage", requestOptions);

					if (response.status === 200) {
						setStore({ auth: true });
						return true;
					} else {
						localStorage.removeItem("token");
						setStore({ auth: false });
						return false;
					}
				} catch (error) {
					console.error('Error verifying token:', error);
					setStore({ auth: false });
					return false;
				}
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
			// getOrders: async () => {
			// 	try {
			// 		const response = await fetch(`${process.env.BACKEND_URL}/api/orders`);
			// 		if (response.ok) {
			// 			const data = await response.json();
			// 			setStore({ orders: data }); // Guardar órdenes en el store
			// 		} else {
			// 			throw new Error("Failed to fetch orders");
			// 		}
			// 	} catch (error) {
			// 		console.error("Error fetching orders:", error);
			// 	}
			// },
			getCustomers: async (page = 1, per_page = 20) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/customers?page=${page}&per_page=${per_page}`);
					if (response.ok) {
						const data = await response.json();
						setStore({ customers: data.customers, totalCustomers: data.total_customers });
					} else {
						throw new Error("Failed to fetch customers");
					}
				} catch (error) {
					console.error("Error fetching customers:", error);
				}
			},
			getShippingDateColor: (shippingDate) => {
				const now = new Date();
				const date = new Date(shippingDate);
				const diffMs = date - now;
				const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

				if (diffDays <= 1) {
					return 'text-danger'; 
				} else if (diffDays <= 3) {
					return 'text-warning'; 
				} else {
					return 'text-success'; 
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
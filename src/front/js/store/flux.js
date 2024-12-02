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
			totalCustomers: 0,
			orders: [],
			totalOrders: 0,
			lineItems: [],
			totalLineItems: 0,
			notification: null 
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
						console.log("Login successful");  // Agregar registro
						return response;
					} else {
						const errorData = await response.json();
						console.error("Login failed:", errorData);  // Agregar registro
						throw new Error(errorData.msg || "Login failed");
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
			getOrders: async (page = 1, per_page = 20, customerId = null) => {
				const token = localStorage.getItem("token");
				const requestOptions = {
					method: 'GET',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				};
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/orders?page=${page}&per_page=${per_page}${customerId ? `&customer_id=${customerId}` : ''}`, requestOptions);
					if (response.ok) {
						const data = await response.json();
						setStore({ orders: data.orders, totalOrders: data.total_orders });
					} else {
						throw new Error("Failed to fetch orders");
					}
				} catch (error) {
					console.error("Error fetching orders:", error);
				}
			},
			getLineItems: async (page = 1, per_page = 20, orderId = null) => {
				const token = localStorage.getItem("token");
				const requestOptions = {
					method: 'GET',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				};
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/line_items?page=${page}&per_page=${per_page}${orderId ? `&order_id=${orderId}` : ''}`, requestOptions);
					if (response.ok) {
						const data = await response.json();
						setStore({ lineItems: data.line_items, totalLineItems: data.total_items });
					} else {
						throw new Error("Failed to fetch line items");
					}
				} catch (error) {
					console.error("Error fetching line items:", error);
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
			deleteOrders: async (selectedOrders) => {
				const token = localStorage.getItem("token");
				const requestOptions = {
					method: 'DELETE',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					},
					body: JSON.stringify({ order_ids: selectedOrders })
				};
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/orders/bulk-delete`, requestOptions);
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(`Failed to delete orders: ${errorData.error || response.statusText}`);
					}
					setStore({ selectedOrders: [] });
					getActions().getOrders(); // Refrescar la lista de pedidos
					setStore({ notification: "Órdenes eliminadas con éxito" }); // Mostrar mensaje de éxito
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				} catch (error) {
					console.error("Error deleting orders:", error);
					setStore({ notification: "Error al eliminar las órdenes" }); // Mostrar mensaje de error
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				}
			},
			getCustomer: async (customerId) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/customers/${customerId}`);
					if (response.ok) {
						const data = await response.json();
						setStore({ customer: data });
					} else {
						throw new Error("Failed to fetch customer");
					}
				} catch (error) {
					console.error("Error fetching customer:", error);
				}
			},
			updateCustomer: async (customerId, updatedCustomer) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/customers/${customerId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(updatedCustomer)
					});
					if (response.ok) {
						const data = await response.json();
						setStore({ customer: data });
					} else {
						throw new Error("Failed to update customer");
					}
				} catch (error) {
					console.error("Error updating customer:", error);
				}
			},
			getCustomerOrders: async (customerId, page = 1, per_page = 20) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/orders?customer_id=${customerId}&page=${page}&per_page=${per_page}`);
					if (response.ok) {
						const data = await response.json();
						setStore({ orders: data.orders, totalOrders: data.total_orders });
					} else {
						throw new Error("Failed to fetch customer orders");
					}
				} catch (error) {
					console.error("Error fetching customer orders:", error);
				}
			},
			initializeAuth: () => {
				const token = localStorage.getItem("token");
				if (token) {
					setStore({ auth: true });
				} else {
					setStore({ auth: false });
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
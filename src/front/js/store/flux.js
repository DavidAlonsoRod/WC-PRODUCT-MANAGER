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
			notification: null,
			isFetchingCustomers: false,
			isFetchingOrders: false,
			isFetchingLineItems: false,
			orderUpdateIntervalId: null
		},
		actions: {


			//########################## !!!! CUSTOMER ¡¡¡¡¡ ################################//

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
						setStore({ auth: true, notification: "Login successful" });
						setTimeout(() => setStore({ notification: null }), 3000);
						return response;
					} else {
						const errorData = await response.json();
						setStore({ notification: "Login failed" });
						setTimeout(() => setStore({ notification: null }), 3000);
						throw new Error(errorData.msg || "Login failed");
					}
				} catch (error) {
					setStore({ notification: "Error during login" });
					setTimeout(() => setStore({ notification: null }), 3000);
					return { ok: false };
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


			//########################## !!!! ORDERS ¡¡¡¡¡ ################################//


			getOrders: async (page = 1, per_page = 20, customerId = null, filters = {}) => {
				const store = getStore();
				if (store.isFetchingOrders) return; // Evitar múltiples solicitudes
				setStore({ isFetchingOrders: true });
				const token = localStorage.getItem("token");
				if (!token) {
					console.error("No token found");
					setStore({ auth: false });
					return;
				}
				if (isNaN(page) || isNaN(per_page)) {
					console.error("Invalid page or per_page value");
					return;
				}
				const params = new URLSearchParams({
					page: String(page),
					per_page: String(per_page),
					...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value ? String(value) : '']))
				});
				if (customerId) {
					params.append('customer_id', String(customerId));
				}
				const requestOptions = {
					method: 'GET',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				};
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/orders?${params.toString()}`, requestOptions);
					if (response.ok) {
						const data = await response.json();
						setStore({ orders: data.orders, totalOrders: data.total_orders });
					} else {
						const errorData = await response.json();
						console.error("Failed to fetch orders:", errorData);
						if (response.status === 401) {
							localStorage.removeItem("token");
							setStore({ auth: false });
						}
						throw new Error("Failed to fetch orders");
					}
				} catch (error) {
					console.error("Error fetching orders:", error);
					setStore({ isFetchingOrders: false });
				}
			},
			getLineItems: async (page = 1, per_page = 20, orderId = null, filters = {}) => {
				const store = getStore();
				if (store.isFetchingLineItems) return; // Evitar múltiples solicitudes
				setStore({ isFetchingLineItems: true });
				const token = localStorage.getItem("token");
				if (!token) {
					console.error("No token found");
					setStore({ auth: false });
					return;
				}
				const params = new URLSearchParams({
					page: String(page),
					per_page: String(per_page),
					...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value ? String(value) : '']))
				});
				if (orderId) {
					params.append('order_id', String(orderId));
				}
				const requestOptions = {
					method: 'GET',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				};
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/line_items?${params.toString()}`, requestOptions);
					if (response.ok) {
						const data = await response.json();
						setStore({ lineItems: data.line_items, totalLineItems: data.total_items });
					} else {
						const errorData = await response.json();
						console.error("Failed to fetch orders:", errorData);
						if (response.status === 401) {
							localStorage.removeItem("token");
							setStore({ auth: false });
						}
						throw new Error("Failed to fetch orders");
					}
				} catch (error) {
					console.error("Error fetching orders:", error);
					setStore({ isFetchingLineItems: false });
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
					const response = await fetch(`${process.env.BACKEND_URL} / api / orders / bulk - delete `, requestOptions);
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(`Failed to delete orders: ${errorData.error || response.statusText}`);
					}
					setStore({ selectedOrders: [] });
					await getActions().getOrders(); // Refrescar la lista de pedidos
					setStore({ notification: "Órdenes eliminadas con éxito" }); // Mostrar mensaje de éxito
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				} catch (error) {
					console.error("Error deleting orders:", error);
					setStore({ notification: "Error al eliminar las órdenes" }); // Mostrar mensaje de error
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				}
			},
			deleteOrder: async (orderId) => {
				const token = localStorage.getItem("token");
				const requestOptions = {
					method: 'DELETE',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				};
				try {
					const response = await fetch(`${process.env.BACKEND_URL} / api / orders / ${orderId}`, requestOptions);
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(`Failed to delete order: ${errorData.error || response.statusText}`);
					}
					await getActions().getOrders(); // Refrescar la lista de pedidos
					setStore({ notification: "Orden eliminada con éxito" }); // Mostrar mensaje de éxito
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				} catch (error) {
					console.error("Error deleting order:", error);
					setStore({ notification: "Error al eliminar la orden" }); // Mostrar mensaje de error
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				}
			},
			getOrder: async (orderId) => {
				try {
					const token = localStorage.getItem("token");
					if (!token) {
						console.error("No token found");
						setStore({ auth: false });
						return;
					}

					const response = await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (response.ok) {
						const data = await response.json();
						setStore({ order: data });
					} else {
						throw new Error("Failed to fetch order");
					}
				} catch (error) {
					console.error("Error fetching order:", error);
				}
			},

			//########################## !!!! CUSTOMER ¡¡¡¡¡ ################################//

			getCustomer: async (customerId) => {
				try {
					const token = localStorage.getItem("token");
					if (!token) {
						console.error("No token found");
						setStore({ auth: false });
						return;
					}

					const response = await fetch(`${process.env.BACKEND_URL}/api/customers/${customerId}`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (response.ok) {
						const data = await response.json();
						setStore({ customer: data });
						return data;
					} else {
						throw new Error("Failed to fetch customer");
					}
				} catch (error) {
					console.error("Error fetching customer:", error);
					throw error;
				}
			},

			updateCustomer: async (customerId, updatedCustomer) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL} / api / customers / ${customerId}`, {
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
					const response = await fetch(`${process.env.BACKEND_URL} / api / orders ? customer_id = ${customerId} & page=${page} & per_page=${per_page}`);
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
			},
			startOrderUpdateInterval: () => {
				const intervalId = setInterval(() => {
					getActions().getOrders().catch(error => {
						console.error("Error fetching orders:", error);
					});
				}, 120000); // 2 minutos
				setStore({ orderUpdateIntervalId: intervalId });
			},
			stopOrderUpdateInterval: () => {
				const store = getStore();
				if (store.orderUpdateIntervalId) {
					clearInterval(store.orderUpdateIntervalId);
					setStore({ orderUpdateIntervalId: null });
				}
			},
			importOrders: async () => {
				const token = localStorage.getItem("token");
				const requestOptions = {
					method: 'GET',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				};
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/import_orders`, requestOptions);
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(`Failed to import orders: ${errorData.error || response.statusText}`);
					}
					setStore({ notification: "Órdenes actualizadas con éxito" }); // Mostrar mensaje de éxito
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				} catch (error) {
					console.error("Error importing orders:", error);
					setStore({ notification: "Error al actualizar las órdenes" }); // Mostrar mensaje de error
					setTimeout(() => setStore({ notification: null }), 3000); // Limpiar mensaje después de 3 segundos
				}
			},
			updateInternalNoteToLineItem: async (itemId, note) => {
				try {
					const token = localStorage.getItem("token");
					const response = await fetch(`${process.env.BACKEND_URL}/api/lineitems/${itemId}/note`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify({ note })
					});

					if (!response.ok) {
						throw new Error("Failed to update note");
					}

					const data = await response.json();
					const updatedLineItems = getStore().lineItems.map(item =>
						item.id === itemId ? { ...item, internal_note: note } : item
					);
					setStore({ lineItems: updatedLineItems });
					return data;
				} catch (error) {
					console.error("Error updating note:", error);
					throw error;
				}
			},
			updateLineItemStatus: async (itemId, status) => {
				try {
					const token = localStorage.getItem("token");
					const response = await fetch(`${process.env.BACKEND_URL}/api/lineitems/${itemId}/status`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify({ status })
					});

					if (!response.ok) {
						throw new Error("Failed to update line item status");
					}

					const data = await response.json();
					await getActions().checkAndUpdateOrderStatus(data.order_id);
					return data;
				} catch (error) {
					console.error("Error updating line item status:", error);
					throw error;
				}
			},
			checkAndUpdateOrderStatus: async (orderId) => {
				const store = getStore();
				const lineItems = store.lineItems.filter(item => item.order_id === orderId);
				const allFinalized = lineItems.every(item => item.status === "finalizado");

				if (allFinalized) {
					try {
						const token = localStorage.getItem("token");
						const response = await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}/status`, {
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
								"Authorization": `Bearer ${token}`
							},
							body: JSON.stringify({ status: "completed" })
						});

						if (!response.ok) {
							throw new Error("Failed to update order status");
						}

						const data = await response.json();
						const updatedOrders = store.orders.map(order =>
							order.id === orderId ? { ...order, status: "completed" } : order
						);
						setStore({ orders: updatedOrders });

						// Actualizar el estado en WooCommerce
						await fetch(`${process.env.WOOCOMMERCE_API_URL}/orders/${orderId}`, {
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
								"Authorization": `Bearer ${token}`
							},
							body: JSON.stringify({ status: "completed" })
						});
					} catch (error) {
						console.error("Error updating order status:", error);
					}
				}
			},
			setLineItems: (lineItems) => {
				setStore({ lineItems });
			},
			updateOrderStatus: async (orderId, status) => {
				try {
					const token = localStorage.getItem("token");
					const response = await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}/status`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
							"Access-Control-Allow-Origin": "*" // Agregar esta línea
						},
						body: JSON.stringify({ status })
					});

					if (!response.ok) {
						throw new Error("Failed to update order status");
					}

					const data = await response.json();
					const updatedOrders = getStore().orders.map(order =>
						order.id === orderId ? { ...order, status } : order
					);
					setStore({ orders: updatedOrders });

					// Actualizar el estado en WooCommerce
					const wcResponse = await fetch(`${process.env.WOOCOMMERCE_API_URL}/orders/${orderId}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify({ status })
					});

					if (!wcResponse.ok) {
						throw new Error("Failed to update order status in WooCommerce");
					}
				} catch (error) {
					console.error("Error updating order status:", error);
					throw error;
				}
			},
			updateOrderShippingStatus: async (orderId, newStatus, currentDate) => {
				try {
					const token = localStorage.getItem("token");
					const response = await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}/shipping-status`, {
						method: 'PUT',
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
							"Access-Control-Allow-Origin": "*" // Agregar esta línea
						},
						body: JSON.stringify({ status: newStatus, date: currentDate })
					});
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(`Failed to update shipping status: ${errorData.error || response.statusText}`);
					}
					const data = await response.json();
					const updatedOrders = getStore().orders.map(order =>
						order.id === orderId ? { ...order, shipping_status: newStatus, shipping_date: currentDate } : order
					);
					setStore({ orders: updatedOrders });
					return data;
				} catch (error) {
					console.error("Error updating shipping status:", error);
					throw error;
				}
			}
		}
	};
};

export default getState;
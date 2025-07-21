export interface KeapConfig {
    serviceAccountKey: string;
  }
  
  export interface KeapOrder {
    id: string;
    title: string;
    status: string;
    total: {
      amount: number;
      currency_code: string;
      formatted_amount: string;
    };
    order_time: string;
    creation_time: string;
    contact: {
      id: string;
      email: string;
      given_name: string;
      family_name: string;
    };
    order_items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: {
        amount: number;
        currency_code: string;
        formatted_amount: string;
      };
      product: {
        id: string;
        name: string;
        description: string;
      };
    }>;
  }
  
  export class KeapClient {
    private serviceAccountKey: string;
    private baseUrl = 'https://api.infusionsoft.com/crm/rest/v2';
  
    constructor(config: KeapConfig) {
      this.serviceAccountKey = config.serviceAccountKey;
    }
  
    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'X-Keap-API-Key': this.serviceAccountKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Keap API error: ${response.status} ${response.statusText}`);
      }
  
      return response.json();
    }
  
    async getOrders(limit: number = 100, offset: number = 0): Promise<{ orders: KeapOrder[]; count: number }> {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
  
      const response = await this.makeRequest<{ orders: KeapOrder[]; count?: number }>(
        `/orders?${params.toString()}`
      );
  
      // Handle the actual API response format
      if (Array.isArray(response)) {
        return { orders: response, count: response.length };
      }
      
      return {
        orders: response.orders || [],
        count: response.count || (response.orders ? response.orders.length : 0)
      };
    }
  
    async getAllOrders(): Promise<KeapOrder[]> {
      const allOrders: KeapOrder[] = [];
      let offset = 0;
      const limit = 100;
  
      while (true) {
        const { orders, count } = await this.getOrders(limit, offset);
        allOrders.push(...orders);
  
        if (allOrders.length >= count) {
          break;
        }
  
        offset += limit;
      }
  
      return allOrders;
    }
  }
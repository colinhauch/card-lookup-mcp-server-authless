import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

export interface DatabaseConfig {
	WEAVIATE_URL: string;
	WEAVIATE_API_KEY: string;
}

export class DatabaseService {
	private static instance: DatabaseService | null = null;
	private weaviateClient: WeaviateClient | null = null;
	private isConnected: boolean = false;

	private constructor() {}

	/**
	 * Get the singleton instance of the database service
	 */
	static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService();
		}
		return DatabaseService.instance;
	}

	/**
	 * Initialize the Weaviate connection
	 */
	async connect(config: DatabaseConfig): Promise<void> {
		if (this.isConnected && this.weaviateClient) {
			console.log('✅ Database already connected');
			return;
		}

		if (!config.WEAVIATE_URL || !config.WEAVIATE_API_KEY) {
			throw new Error('WEAVIATE_URL and WEAVIATE_API_KEY are required for database connection');
		}

		try {
			// Extract hostname without protocol for REST API connection
			let weaviateHost = config.WEAVIATE_URL;
			if (weaviateHost.startsWith('https://')) {
				weaviateHost = weaviateHost.replace('https://', '');
			} else if (weaviateHost.startsWith('http://')) {
				weaviateHost = weaviateHost.replace('http://', '');
			}
			
			// Try using connectToLocal with HTTPS settings for cloud instance
			this.weaviateClient = await weaviate.connectToLocal({
				host: weaviateHost,
				port: 443,
				authCredentials: new ApiKey(config.WEAVIATE_API_KEY),
				skipInitChecks: true
			});
			
			// Test the connection with a simple query
			try {
				await this.weaviateClient.collections.listAll();
				this.isConnected = true;
				console.log('✅ Successfully connected to Weaviate database');
			} catch (testError) {
				console.log('⚠️ Connection established but cluster may not be ready yet');
				this.isConnected = true;
			}
		} catch (error) {
			console.error('❌ Failed to connect to Weaviate:', error);
			this.weaviateClient = null;
			this.isConnected = false;
			throw error;
		}
	}

	/**
	 * Close the database connection
	 */
	async disconnect(): Promise<void> {
		if (this.weaviateClient) {
			this.weaviateClient.close();
			this.weaviateClient = null;
			this.isConnected = false;
			console.log('🔌 Database connection closed');
		}
	}

	/**
	 * Get the Weaviate client instance
	 */
	getClient(): WeaviateClient | null {
		return this.weaviateClient;
	}

	/**
	 * Check if the database is connected
	 */
	isConnectedToDatabase(): boolean {
		return this.isConnected && this.weaviateClient !== null;
	}

	/**
	 * Test the database connection
	 */
	async testConnection(): Promise<boolean> {
		if (!this.weaviateClient) {
			return false;
		}

		try {
			// Use a simple REST API call instead of isReady() to avoid gRPC
			await this.weaviateClient.collections.listAll();
			return true;
		} catch (error) {
			console.error('Database connection test failed:', error);
			return false;
		}
	}
}

// Export a convenience function to get the database instance
export const getDatabase = () => DatabaseService.getInstance();

// Default export for compatibility
export default DatabaseService;

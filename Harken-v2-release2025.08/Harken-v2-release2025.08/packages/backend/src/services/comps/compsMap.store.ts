import database from '../../config/db';
import { Op, QueryTypes } from 'sequelize';
import {
	IMapFilters,
	IGeoCluster,
	IGeoClusterResponse,
	IMapSearchResponse,
	IMapStatsResponse,
} from './ICompsMapService';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';

const Comps = database.comps;
const helperFunction = new HelperFunction();

export default class CompsMapStore {
	constructor() {}

	/**
	 * @description Get geo-clustered properties for map display
	 * @param bounds Map bounds
	 * @param zoom Current zoom level
	 * @param filters Property filters
	 * @param accountId User's account ID
	 * @returns Clustered properties
	 */
	public async getGeoClusters(
		bounds: { north: number; south: number; east: number; west: number },
		zoom: number,
		filters: IMapFilters = {},
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IGeoClusterResponse> {
		try {
			// Determine clustering strategy based on zoom level
			const clusterSize = this.getClusterSize(zoom);
			const shouldCluster = zoom < 15; // Don't cluster at high zoom levels

			if (shouldCluster) {
				return await this.getClusteredData(
					bounds,
					zoom,
					clusterSize,
					filters,
					accountId,
					userId,
					role,
				);
			} else {
				return await this.getIndividualProperties(bounds, filters, accountId, userId, role);
			}
		} catch (error) {
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error,
			});
			throw error;
		}
	}

	/**
	 * @description Get clustered data using spatial clustering
	 */
	private async getClusteredData(
		bounds: { north: number; south: number; east: number; west: number },
		zoom: number,
		clusterSize: number,
		filters: IMapFilters,
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IGeoClusterResponse> {
		const whereClause = this.buildWhereClause(bounds, filters, accountId, userId, role);

		// Use ST_ClusterKMeans or grid-based clustering for better performance
		// const query = `
		// 	WITH clustered_properties AS (
		// 		SELECT
		// 			*,
		// 			FLOOR(
		// 				CAST(CASE WHEN map_pin_lat REGEXP '^-?[0-9]+\\.?[0-9]*$' THEN map_pin_lat ELSE NULL END AS DECIMAL(10,6)) * :clusterSize
		// 			) / :clusterSize AS lat_cluster,
		// 			FLOOR(
		// 				CAST(CASE WHEN map_pin_lng REGEXP '^-?[0-9]+\\.?[0-9]*$' THEN map_pin_lng ELSE NULL END AS DECIMAL(10,6)) * :clusterSize
		// 			) / :clusterSize AS lng_cluster
		// 		FROM comps
		// 		WHERE ${whereClause.sql}
		// 	),
		// 	cluster_stats AS (
		// 		SELECT
		// 			CONCAT(lat_cluster, '_', lng_cluster) as cluster_id,
		// 			lat_cluster,
		// 			lng_cluster,
		// 			COUNT(*) as count,
		//             AVG(CAST(CASE WHEN sale_price REGEXP '^[0-9]+\\.?[0-9]*$' THEN sale_price ELSE NULL END AS DECIMAL(15,2))) AS avg_price,
		//             AVG(CAST(CASE WHEN building_size REGEXP '^[0-9]+\\.?[0-9]*$' THEN building_size ELSE NULL END AS DECIMAL(10,2))) AS avg_size,
		//             AVG(CAST(CASE WHEN price_square_foot REGEXP '^[0-9]+\\.?[0-9]*$' THEN price_square_foot ELSE NULL END AS DECIMAL(10,2))) AS avg_price_per_sf,
		//             MIN(CAST(CASE WHEN map_pin_lat REGEXP '^-?[0-9]+\\.?[0-9]*$' THEN map_pin_lat ELSE NULL END AS DECIMAL(10,6))) AS min_lat,
		//             MAX(CAST(CASE WHEN map_pin_lat REGEXP '^-?[0-9]+\\.?[0-9]*$' THEN map_pin_lat ELSE NULL END AS DECIMAL(10,6))) AS max_lat,
		//             MIN(CAST(CASE WHEN map_pin_lng REGEXP '^-?[0-9]+\\.?[0-9]*$' THEN map_pin_lng ELSE NULL END AS DECIMAL(10,6))) AS min_lng,
		//             MAX(CAST(CASE WHEN map_pin_lng REGEXP '^-?[0-9]+\\.?[0-9]*$' THEN map_pin_lng ELSE NULL END AS DECIMAL(10,6))) AS max_lng,
		// 			GROUP_CONCAT(DISTINCT property_class SEPARATOR ',') as property_types
		// 		FROM clustered_properties
		// 		GROUP BY lat_cluster, lng_cluster
		// 	)
		// 	SELECT * FROM cluster_stats
		// 	ORDER BY count DESC
		// 	LIMIT 500
		// `;

		const query = `
			SELECT 
				CONCAT(
				FLOOR(lat_decimal * :clusterSize) / :clusterSize, '_',
				FLOOR(lng_decimal * :clusterSize) / :clusterSize
				) as cluster_id,
				FLOOR(lat_decimal * :clusterSize) / :clusterSize as lat_cluster,
				FLOOR(lng_decimal * :clusterSize) / :clusterSize as lng_cluster,
				COUNT(*) as count,
				AVG(CASE WHEN price_decimal > 0 THEN price_decimal ELSE NULL END) as avg_price,
				AVG(CASE WHEN size_decimal > 0 THEN size_decimal ELSE NULL END) as avg_size,
				AVG(CASE WHEN psf_decimal > 0 THEN psf_decimal ELSE NULL END) as avg_price_per_sf,
				MIN(lat_decimal) as min_lat,
				MAX(lat_decimal) as max_lat,
				MIN(lng_decimal) as min_lng,
				MAX(lng_decimal) as max_lng,
				GROUP_CONCAT(DISTINCT COALESCE(property_class, '') SEPARATOR ',') as property_types
			FROM (
				SELECT 
				*,
				CASE 
					WHEN map_pin_lat REGEXP '^-?[0-9]+\\.?[0-9]*$' 
					THEN CAST(map_pin_lat AS DECIMAL(10,6))
					ELSE NULL 
				END as lat_decimal,
				CASE 
					WHEN map_pin_lng REGEXP '^-?[0-9]+\\.?[0-9]*$' 
					THEN CAST(map_pin_lng AS DECIMAL(10,6))
					ELSE NULL 
				END as lng_decimal,
				CASE 
					WHEN sale_price REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(sale_price AS DECIMAL(15,2)) > 0
					THEN CAST(sale_price AS DECIMAL(15,2))
					ELSE NULL 
				END as price_decimal,
				CASE 
					WHEN building_size REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(building_size AS DECIMAL(10,2)) > 0
					THEN CAST(building_size AS DECIMAL(10,2))
					ELSE NULL 
				END as size_decimal,
				CASE 
					WHEN price_square_foot REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(price_square_foot AS DECIMAL(10,2)) > 0
					THEN CAST(price_square_foot AS DECIMAL(10,2))
					ELSE NULL 
				END as psf_decimal
				FROM comps
				WHERE ${whereClause.sql}
			) as valid_data
			WHERE lat_decimal IS NOT NULL 
				AND lng_decimal IS NOT NULL
				AND lat_decimal BETWEEN :south AND :north
				AND lng_decimal BETWEEN :west AND :east
			GROUP BY lat_cluster, lng_cluster
			HAVING COUNT(*) > 0
			ORDER BY count DESC
			LIMIT 500
		`;

		console.log('***************************************************************');
		const results = await database.sequelize.query(query, {
			type: QueryTypes.SELECT,
			replacements: {
				clusterSize: clusterSize,
				...whereClause.replacements,
			},
		});
		console.log('***************************************************************');

		const clusters: IGeoCluster[] = results.map((row: any) => ({
			id: row.cluster_id,
			bounds: {
				north: row.max_lat,
				south: row.min_lat,
				east: row.max_lng,
				west: row.min_lng,
			},
			center: {
				lat: (Number(row.min_lat) + Number(row.max_lat)) / 2,
				lng: (Number(row.min_lng) + Number(row.max_lng)) / 2,
			},
			count: row.count,
			avgPrice: row.avg_price,
			avgSize: row.avg_size,
			avgPricePerSf: row.avg_price_per_sf,
			propertyTypes: row.property_types ? row.property_types.split(',') : [],
			zoom: zoom,
		}));

		return {
			clusters,
			totalCount: clusters.reduce((sum, cluster) => sum + cluster.count, 0),
			bounds,
			zoom,
			center: {
				lat: (Number(bounds.north) + Number(bounds.south)) / 2,
				lng: (Number(bounds.east) + Number(bounds.west)) / 2,
			},
		};
	}

	/**
	 * @description Get individual properties when zoomed in
	 */
	private async getIndividualProperties(
		bounds: { north: number; south: number; east: number; west: number },
		filters: IMapFilters,
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IGeoClusterResponse> {
		const whereClause = this.buildWhereClause(bounds, filters, accountId, userId, role);

		const properties = await Comps.findAll({
			where: whereClause.conditions,
			attributes: [
				'id',
				'street_address',
				'city',
				'state',
				'zipcode',
				'type',
				'property_class',
				'sale_price',
				'lease_rate',
				'building_size',
				'land_size',
				'price_square_foot',
				'date_sold',
				'year_built',
				'condition',
				'map_pin_lat',
				'map_pin_lng',
				'property_image_url',
				'summary',
				'created',
			],
			limit: 500, // Limit for performance
			order: [['created', 'DESC']],
		});

		// Convert individual properties to clusters
		const clusters: IGeoCluster[] = properties.map((prop: any) => ({
			id: `single_${prop.id}`,
			bounds: {
				north: parseFloat(prop.map_pin_lat) + 0.0001,
				south: parseFloat(prop.map_pin_lat) - 0.0001,
				east: parseFloat(prop.map_pin_lng) + 0.0001,
				west: parseFloat(prop.map_pin_lng) - 0.0001,
			},
			center: {
				lat: parseFloat(prop.map_pin_lat),
				lng: parseFloat(prop.map_pin_lng),
			},
			count: 1,
			avgPrice: prop.sale_price || prop.lease_rate,
			avgSize: prop.building_size,
			avgPricePerSf: prop.price_square_foot,
			propertyTypes: [prop.property_class || prop.type],
			zoom: 16,
			properties: [prop],
		}));

		return {
			clusters,
			totalCount: properties.length,
			bounds,
			zoom: 16,
			center: {
				lat: (Number(bounds.north) + Number(bounds.south)) / 2,
				lng: (Number(bounds.east) + Number(bounds.west)) / 2,
			},
		};
	}

	/**
	 * @description Get detailed properties within a cluster
	 */
	public async getClusterDetails(
		bounds: { north: number; south: number; east: number; west: number },
		filters: IMapFilters = {},
		pageSize: number = 20,
		page: number = 1,
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IMapSearchResponse> {
		try {
			const whereClause = this.buildWhereClause(bounds, filters, accountId, userId, role);
			const offset = (page - 1) * pageSize;

			const { count, rows } = await Comps.findAndCountAll({
				where: whereClause.conditions,
				attributes: [
					'id',
					'street_address',
					'city',
					'state',
					'zipcode',
					'type',
					'property_class',
					'sale_price',
					'lease_rate',
					'building_size',
					'land_size',
					'price_square_foot',
					'date_sold',
					'year_built',
					'condition',
					'map_pin_lat',
					'map_pin_lng',
					'property_image_url',
					'summary',
					'created',
				],
				limit: pageSize,
				offset: offset,
				order: [['created', 'DESC']],
			});

			return {
				properties: rows,
				totalRecord: count,
				page,
				limit: pageSize,
				totalPages: Math.ceil(count / pageSize),
				filters,
			};
		} catch (error) {
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error,
			});
			throw error;
		}
	}

	/**
	 * @description Get map statistics for the current view
	 */
	public async getMapStats(
		bounds: { north: number; south: number; east: number; west: number },
		filters: IMapFilters = {},
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IMapStatsResponse> {
		try {
			const whereClause = this.buildWhereClause(bounds, filters, accountId, userId, role);

			// Get basic stats
			const statsQuery = `
				SELECT 
					COUNT(*) as total_properties,
					AVG(CAST(sale_price AS DECIMAL(15,2))) as avg_price,
					AVG(CAST(building_size AS DECIMAL(10,2))) as avg_size,
					AVG(CAST(price_square_foot AS DECIMAL(10,2))) as avg_price_per_sf,
					MIN(CAST(sale_price AS DECIMAL(15,2))) as min_price,
					MAX(CAST(sale_price AS DECIMAL(15,2))) as max_price,
					MIN(CAST(building_size AS DECIMAL(10,2))) as min_size,
					MAX(CAST(building_size AS DECIMAL(10,2))) as max_size
				FROM comps 
				WHERE ${whereClause.sql}
			`;

			const statsResult = await database.sequelize.query(statsQuery, {
				type: QueryTypes.SELECT,
				replacements: whereClause.replacements,
			});

			// Get property type distribution
			const typeDistributionQuery = `
				SELECT 
					property_class as type,
					COUNT(*) as count,
					(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM comps WHERE ${whereClause.sql})) as percentage
				FROM comps 
				WHERE ${whereClause.sql}
				GROUP BY property_class
				ORDER BY count DESC
			`;

			const typeDistribution = await database.sequelize.query(typeDistributionQuery, {
				type: QueryTypes.SELECT,
				replacements: whereClause.replacements,
			});

			// Get city distribution
			const cityStatsQuery = `
				SELECT 
					city,
					COUNT(*) as count,
					AVG(CAST(sale_price AS DECIMAL(15,2))) as avg_price
				FROM comps 
				WHERE ${whereClause.sql}
				GROUP BY city
				ORDER BY count DESC
				LIMIT 10
			`;

			const cityStats = await database.sequelize.query(cityStatsQuery, {
				type: QueryTypes.SELECT,
				replacements: whereClause.replacements,
			});

			// Get recent transactions
			const recentTransactions = await Comps.findAll({
				where: whereClause.conditions,
				attributes: [
					'id',
					'street_address',
					'city',
					'state',
					'sale_price',
					'building_size',
					'price_square_foot',
					'date_sold',
					'property_class',
				],
				limit: 10,
				order: [['date_sold', 'DESC']],
			});

			const stats = statsResult[0] as any;

			return {
				totalProperties: parseInt(stats.total_properties),
				avgPrice: parseFloat(stats.avg_price) || 0,
				avgSize: parseFloat(stats.avg_size) || 0,
				avgPricePerSf: parseFloat(stats.avg_price_per_sf) || 0,
				priceRange: {
					min: parseFloat(stats.min_price) || 0,
					max: parseFloat(stats.max_price) || 0,
				},
				sizeRange: {
					min: parseFloat(stats.min_size) || 0,
					max: parseFloat(stats.max_size) || 0,
				},
				propertyTypes: typeDistribution as any[],
				cities: cityStats as any[],
				recentTransactions: recentTransactions as any[],
			};
		} catch (error) {
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error,
			});
			throw error;
		}
	}

	/**
	 * @description Build where clause for map queries
	 */
	private buildWhereClause(
		bounds: { north: number; south: number; east: number; west: number },
		filters: IMapFilters,
		accountId?: number,
		userId?: number,
		role?: number,
	) {
		const conditions: any = {};
		const sqlParts: string[] = [];
		const replacements: any = {};

		// Geographic bounds
		conditions.map_pin_lat = {
			[Op.between]: [bounds.south, bounds.north],
		};
		conditions.map_pin_lng = {
			[Op.between]: [bounds.west, bounds.east],
		};

		sqlParts.push(
			'CAST(map_pin_lat AS DECIMAL(10,6)) BETWEEN :south AND :north',
			'CAST(map_pin_lng AS DECIMAL(10,6)) BETWEEN :west AND :east',
		);
		replacements.south = bounds.south;
		replacements.north = bounds.north;
		replacements.west = bounds.west;
		replacements.east = bounds.east;

		// Role-based filtering
		if (role === RoleEnum.ADMINISTRATOR && accountId) {
			conditions.account_id = accountId;
			sqlParts.push('account_id = :accountId');
			replacements.accountId = accountId;
		} else if (role === RoleEnum.USER && userId) {
			conditions.user_id = userId;
			sqlParts.push('user_id = :userId');
			replacements.userId = userId;
		}

		// Apply filters
		if (filters.type) {
			conditions.type = filters.type;
			sqlParts.push('type = :type');
			replacements.type = filters.type;
		}
		if (filters.state) {
			conditions.state = filters.state;
			sqlParts.push('state = :state');
			replacements.state = filters.state;
		}
		if (filters.city) {
			conditions.city = filters.city;
			sqlParts.push('city IN (:city)');
			replacements.city = filters.city;
		}

		if (filters.propertyType && filters.propertyType.length > 0) {
			conditions.property_class = { [Op.in]: filters.propertyType };
			sqlParts.push('property_class IN (:propertyTypes)');
			replacements.propertyTypes = filters.propertyType;
		}

		if (filters.search) {
			conditions[Op.or] = [
				{ street_address: { [Op.like]: `%${filters.search}%` } },
				{ city: { [Op.like]: `%${filters.search}%` } },
				{ zipcode: { [Op.like]: `%${filters.search}%` } },
			];
			sqlParts.push('(street_address LIKE :search OR city LIKE :search OR zipcode LIKE :search)');
			replacements.search = `%${filters.search}%`;
		}

		return {
			conditions,
			sql: sqlParts.join(' AND '),
			replacements,
		};
	}

	/**
	 * @description Determine cluster size based on zoom level
	 */
	private getClusterSize(zoom: number): number {
		if (zoom <= 8) return 10; // Very large clusters
		if (zoom <= 10) return 50; // Large clusters
		if (zoom <= 12) return 100; // Medium clusters
		if (zoom <= 14) return 500; // Small clusters
		return 1000; // Very small clusters
	}
}

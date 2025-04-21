// import { getFullData } from '@/app/lib/getFullData';

// export async function fetchCategory(): Promise<{ success: boolean; distinctData?: Record<string, any[]>; error?: string }> {
//     try {
//         const data = await getFullData();
//         const collection = data.collection(process.env.MONGODB_COLLECTION!);

//         // Fetch distinct values for specific fields
//         const fieldsToFetch = ['listCategory', 'listSubCategory'];
//         const distinctData: Record<string, any[]> = {};

//         for (const field of fieldsToFetch) {
//             try {
//                 distinctData[field] = await collection.distinct(field);
//             } catch (err) {
//                 console.warn(`Error getting distinct values for field "${field}":`, err);
//                 distinctData[field] = [];
//             }
//         }

//         return { success: true, distinctData };
//     } catch (error) {
//         console.error('Error in fetchCategory:', error);
//         return { success: false, error: 'Failed to fetch category data' };
//     }
// }
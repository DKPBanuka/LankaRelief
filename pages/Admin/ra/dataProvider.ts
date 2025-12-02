import { DataProvider, fetchUtils } from 'react-admin';
import { db } from '../../../services/firebase';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter
} from 'firebase/firestore';

export const dataProvider: DataProvider = {
    getList: async (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        // Basic implementation: fetch all and slice (Firestore pagination is complex for random access)
        // For a small app, this is fine. For larger, we'd need cursor-based pagination.
        const colRef = collection(db, resource);
        const snapshot = await getDocs(colRef);

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side sorting and pagination for simplicity
        // In a real large-scale app, this should be done via Firestore queries
        data.sort((a: any, b: any) => {
            if (field === 'id') return 0; // Skip id sort
            if (a[field] < b[field]) return order === 'ASC' ? -1 : 1;
            if (a[field] > b[field]) return order === 'ASC' ? 1 : -1;
            return 0;
        });

        const start = (page - 1) * perPage;
        const end = start + perPage;

        return {
            data: data.slice(start, end),
            total: data.length,
        };
    },

    getOne: async (resource, params) => {
        const docRef = doc(db, resource, params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { data: { id: docSnap.id, ...docSnap.data() } };
        }
        throw new Error('Document not found');
    },

    getMany: async (resource, params) => {
        // Fetch multiple docs by ID
        const promises = params.ids.map(id => getDoc(doc(db, resource, id.toString())));
        const snapshots = await Promise.all(promises);
        const data = snapshots
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() }));
        return { data };
    },

    getManyReference: async (resource, params) => {
        // Not implemented for this basic version
        return { data: [], total: 0 };
    },

    create: async (resource, params) => {
        const colRef = collection(db, resource);
        const docRef = await addDoc(colRef, {
            ...params.data,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        return { data: { ...params.data, id: docRef.id } };
    },

    update: async (resource, params) => {
        const docRef = doc(db, resource, params.id);
        await updateDoc(docRef, {
            ...params.data,
            updatedAt: Date.now()
        });
        return { data: params.data };
    },

    updateMany: async (resource, params) => {
        const promises = params.ids.map(id =>
            updateDoc(doc(db, resource, id.toString()), { ...params.data, updatedAt: Date.now() })
        );
        await Promise.all(promises);
        return { data: params.ids };
    },

    delete: async (resource, params) => {
        const docRef = doc(db, resource, params.id);
        await deleteDoc(docRef);
        return { data: params.previousData as any };
    },

    deleteMany: async (resource, params) => {
        const promises = params.ids.map(id => deleteDoc(doc(db, resource, id.toString())));
        await Promise.all(promises);
        return { data: params.ids };
    },
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Need, Person, Event, NeedStatus, Volunteer, ServiceRequest } from '../types';
import { db, storage } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, runTransaction, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

interface AppContextType {
  needs: Need[];
  serviceRequests: ServiceRequest[];
  people: Person[];
  events: Event[];
  addNeed: (need: Need) => Promise<void>;
  updateNeedStatus: (id: string, status: NeedStatus) => void;
  deleteNeed: (id: string) => void;
  pledgeToNeed: (id: string, amount: number, pin: string) => Promise<void>;
  receiveDonation: (id: string, amount: number) => Promise<void>;
  reopenNeed: (id: string) => Promise<void>;
  addPerson: (person: Person) => void;
  deletePerson: (id: string) => void;
  registerForEvent: (eventId: string) => void;
  deleteEvent: (id: string) => void;
  volunteers: Volunteer[];
  addVolunteer: (volunteer: Volunteer) => void;
  deleteVolunteer: (id: string) => void;
  deleteWithPin: (collectionName: string, docId: string, pin: string) => Promise<void>;
  updateNeed: (id: string, updateData: Partial<Need>, pin: string) => Promise<void>;
  updatePerson: (id: string, updateData: Partial<Person>, pin: string) => Promise<void>;
  addServiceRequest: (request: ServiceRequest) => Promise<void>;
  stats: {
    totalNeeds: number;
    fulfilledNeeds: number;
    peopleSafe: number;
    missingPeople: number;
    activeVolunteers: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // Real-time listeners
  useEffect(() => {
    const q = query(collection(db, 'needs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const needsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Need));
      setNeeds(needsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'service_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
      setServiceRequests(requestsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'people'), (snapshot) => {
      const peopleData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      setPeople(peopleData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'volunteers'), (snapshot) => {
      const volunteersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
      setVolunteers(volunteersData);
    });
    return () => unsubscribe();
  }, []);

  // Helper to remove undefined values for Firestore
  const sanitizeData = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(sanitizeData).filter(v => v !== undefined);
    }
    if (data !== null && typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, sanitizeData(v)])
      );
    }
    return data;
  };

  const addNeed = async (need: Need) => {
    console.log("Attempting to add need:", need);
    try {
      // Remove id as Firestore generates it
      const { id, ...needData } = need;
      const cleanData = sanitizeData(needData);
      const docRef = await addDoc(collection(db, 'needs'), cleanData);
      console.log("Need added with ID: ", docRef.id);
      savePostIdToLocalStorage(docRef.id);
    } catch (error) {
      console.error("Error adding need: ", error);
      alert("Error adding to database: " + error); // Alert user directly
      throw error;
    }
  };

  const updateNeedStatus = async (id: string, status: NeedStatus) => {
    try {
      const needRef = doc(db, 'needs', id);
      await updateDoc(needRef, { status });
    } catch (error) {
      console.error("Error updating need status: ", error);
    }
  };

  const pledgeToNeed = async (id: string, amount: number, pin: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const needRef = doc(db, 'needs', id);
        const needDoc = await transaction.get(needRef);

        if (!needDoc.exists()) {
          throw new Error("Document does not exist!");
        }

        const needData = needDoc.data() as Need;
        const currentPledged = needData.pledgedAmount || 0;
        const requestedQty = needData.quantity || 0;

        // Check if already fully pledged
        if (currentPledged >= requestedQty) {
          throw new Error("This request is already fully pledged.");
        }

        const newPledged = currentPledged + amount;

        // Determine new status
        let newStatus = NeedStatus.PARTIALLY_PLEDGED;
        if (newPledged >= requestedQty) {
          newStatus = NeedStatus.FULLY_PLEDGED;
        }

        transaction.update(needRef, {
          pledgedAmount: newPledged,
          status: newStatus,
          donorPin: pin, // Note: This overwrites previous donor PIN. In a real app, we'd need a subcollection for pledges.
          pledgedAt: Date.now()
        });
      });

      // Save to donor's local storage
      const existing = localStorage.getItem('athwela_my_pledges');
      const pledges = existing ? JSON.parse(existing) : [];
      if (!pledges.includes(id)) {
        pledges.push(id);
        localStorage.setItem('athwela_my_pledges', JSON.stringify(pledges));
      }

    } catch (error) {
      console.error("Error pledging to need: ", error);
      throw error;
    }
  };

  const receiveDonation = async (id: string, amount: number) => {
    try {
      const need = needs.find(n => n.id === id);
      if (!need) return;

      const newReceived = (need.receivedAmount || 0) + amount;
      const newStatus = NeedStatus.RECEIVED; // Force completion

      const needRef = doc(db, 'needs', id);
      await updateDoc(needRef, {
        receivedAmount: newReceived,
        status: newStatus
      });
    } catch (error) {
      console.error("Error receiving donation: ", error);
      throw error;
    }
  };

  const reopenNeed = async (id: string) => {
    try {
      const needRef = doc(db, 'needs', id);
      // Reset to pending and clear donor info
      await updateDoc(needRef, {
        status: NeedStatus.REQUESTED,
        donorPin: null, // Firestore way to delete field? Or just null/empty string
        pledgedAt: null,
        pledgedAmount: 0 // Reset pledged amount too? User said "clear donorPin and pledgedAt", implies reset.
      });
    } catch (error) {
      console.error("Error reopening need: ", error);
      throw error;
    }
  };

  const addPerson = async (person: Person) => {
    try {
      console.log("Starting addPerson...", { id: person.id, hasImage: !!person.image });
      // Image upload removed as per user request
      const imageUrl = '';

      const { id, ...personData } = person;

      // We allow base64 now if it was the fallback
      const cleanData = sanitizeData({ ...personData, image: imageUrl });
      console.log("Saving to Firestore...", cleanData);

      const docRef = await addDoc(collection(db, 'people'), cleanData);
      console.log("Person saved successfully!");
      savePostIdToLocalStorage(docRef.id);
    } catch (error: any) {
      console.error("Error adding person: ", error);
      // Re-throw the error so the UI can handle it
      throw error;
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        registeredVolunteers: (event.registeredVolunteers || 0) + 1
      });
    } catch (error) {
      console.error("Error registering for event: ", error);
    }
  };

  const addVolunteer = async (volunteer: Volunteer) => {
    try {
      const { id, ...volunteerData } = volunteer;
      const cleanData = sanitizeData(volunteerData);
      const docRef = await addDoc(collection(db, 'volunteers'), cleanData);
      savePostIdToLocalStorage(docRef.id);
    } catch (error) {
      console.error("Error adding volunteer: ", error);
      alert("Error adding volunteer: " + error);
    }
  };

  // Delete functions
  const deleteNeed = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'needs', id));
    } catch (error) {
      console.error("Error deleting need: ", error);
      alert("Error deleting need: " + error);
    }
  };

  const deletePerson = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'people', id));
    } catch (error) {
      console.error("Error deleting person: ", error);
      alert("Error deleting person: " + error);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      console.error("Error deleting event: ", error);
      alert("Error deleting event: " + error);
    }
  };

  const deleteVolunteer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'volunteers', id));
    } catch (error) {
      console.error("Error deleting volunteer: ", error);
      alert("Error deleting volunteer: " + error);
    }
  };

  const savePostIdToLocalStorage = (id: string) => {
    const existing = localStorage.getItem('athwela_my_posts');
    const posts = existing ? JSON.parse(existing) : [];
    posts.push(id);
    localStorage.setItem('athwela_my_posts', JSON.stringify(posts));
  };

  const deleteWithPin = async (collectionName: string, docId: string, pin: string) => {
    try {
      // Client-side validation to avoid Cloud Functions (Blaze Plan requirement)
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Post not found.");
      }

      const data = docSnap.data();
      if (data.secretPin !== pin) {
        throw new Error("Incorrect PIN.");
      }

      await deleteDoc(docRef);

      // Remove from local storage if successful
      const existing = localStorage.getItem('athwela_my_posts');
      if (existing) {
        const posts = JSON.parse(existing);
        const newPosts = posts.filter((p: string) => p !== docId);
        localStorage.setItem('athwela_my_posts', JSON.stringify(newPosts));
      }
    } catch (error: any) {
      console.error("Error deleting with PIN:", error);
      throw new Error(error.message || "Failed to delete post");
    }
  };

  const updateNeed = async (id: string, updateData: Partial<Need>, pin: string) => {
    try {
      // Client-side validation
      const docRef = doc(db, 'needs', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Post not found.");
      }

      const data = docSnap.data() as Need;
      if (data.secretPin !== pin) {
        throw new Error("Incorrect PIN.");
      }

      const cleanData = sanitizeData(updateData);
      // Remove id and secretPin from updateData to prevent accidental overwrite
      const { id: _, secretPin: __, ...safeUpdateData } = cleanData;

      await updateDoc(docRef, safeUpdateData);
    } catch (error: any) {
      console.error("Error updating need:", error);
      throw new Error(error.message || "Failed to update post");
    }
  };

  const updatePerson = async (id: string, updateData: Partial<Person>, pin: string) => {
    try {
      // Client-side validation
      const docRef = doc(db, 'people', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Post not found.");
      }

      const data = docSnap.data() as Person;
      if (data.secretPin !== pin) {
        throw new Error("Incorrect PIN.");
      }

      const cleanData = sanitizeData(updateData);
      // Remove id and secretPin from updateData to prevent accidental overwrite
      const { id: _, secretPin: __, ...safeUpdateData } = cleanData;

      await updateDoc(docRef, safeUpdateData);
    } catch (error: any) {
      console.error("Error updating person:", error);
      throw new Error(error.message || "Failed to update post");
    }
  };

  const addServiceRequest = async (request: ServiceRequest) => {
    try {
      const { id, ...requestData } = request;
      const cleanData = sanitizeData(requestData);
      const docRef = await addDoc(collection(db, 'service_requests'), cleanData);
      console.log("Service Request added with ID: ", docRef.id);
      savePostIdToLocalStorage(docRef.id);
    } catch (error) {
      console.error("Error adding service request: ", error);
      alert("Error adding to database: " + error);
      throw error;
    }
  };

  const stats = {
    totalNeeds: needs.length,
    fulfilledNeeds: needs.filter((n) => n.status === NeedStatus.RECEIVED).length,
    peopleSafe: people.filter((p) => p.status === 'SAFE').length,
    missingPeople: people.filter((p) => p.status === 'MISSING').length,
    activeVolunteers: volunteers.length,
  };

  return (
    <AppContext.Provider
      value={{
        needs,
        serviceRequests,
        people,
        events,
        addNeed,
        updateNeedStatus,
        deleteNeed,
        pledgeToNeed,
        receiveDonation,
        reopenNeed,
        addPerson,
        deletePerson,
        registerForEvent,
        deleteEvent,
        volunteers,
        addVolunteer,
        deleteVolunteer,
        deleteWithPin,
        updateNeed,
        updatePerson,
        addServiceRequest,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
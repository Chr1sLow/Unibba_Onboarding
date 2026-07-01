import {
  serverTimestamp,
  sum,
  count,
  average,
  getDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,
  increment,
  getAggregateFromServer,
  getCountFromServer,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';

import type { OrderByDirection, AggregateSpec, WriteBatch } from 'firebase/firestore';

import {
  signInWithPopup,
  signInWithCredential,
  signOut,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';

import type { User } from 'firebase/auth';

import { db, auth } from '../firebaseConfig';

export type QueryParams = [string, any, any][];
export type QueryOptions = {
  orderBy?: string | [string, 'asc' | 'desc'];
  limit?: number;
  startAt?: any;
  startAfter?: any;
  endAt?: any;
  endBefore?: any;
};
export type AnyEntity = { __id?: string; [key: string]: any };

export class FirebaseService {
  /** Creates a unique id */
  createId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
  }

  afUser(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  login(providerId: string, scope?: string): Promise<any> | undefined {
    const provider = this.getProvider(providerId, scope);

    if (provider) {
      return signInWithPopup(auth, provider);
    } else {
      return undefined;
    }
  }

  private getProvider(providerId: string, scope?: string) {
    let provider;
    switch (providerId) {
      case 'google.com': {
        provider = new GoogleAuthProvider();
        break;
      }
      case 'github.com': {
        provider = new GithubAuthProvider();
        break;
      }
    }
    if (provider && scope) {
      provider.addScope(scope);
    }
    return provider;
  }

  loginLink(error: any) {
    fetchSignInMethodsForEmail(auth, error.email).then(async (providers) => {
      const provider = this.getProvider(providers[0]);

      if (!provider) return;

      signInWithPopup(auth, provider).then((result) => {
        let credential = null;
        if (providers[0] === 'github.com') {
            credential = GithubAuthProvider.credentialFromResult(result);
        } else if (providers[0] === 'google.com') {
            credential = GoogleAuthProvider.credentialFromResult(result);
        }
        
        if (credential) {
            signInWithCredential(auth, credential).then((result2) => {
                linkWithCredential(result2.user, error.credential);
            });
            console.log('Successfully linked');
        }
      });
    });
  }

  logout() {
    return signOut(auth);
  }

  streamEntity<T>(collectionName: string, id: string, callback: (data: T | null) => void) {
    const docRef = doc(db, `${collectionName}/${id}`);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as T);
        } else {
            callback(null);
        }
    });
  }

  streamEntities<T>(collectionName: string, queryParams: QueryParams, queryOptions?: QueryOptions, callback?: (data: T[]) => void) {
    const collectionRef = collection(db, collectionName);
    let q = queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0) 
        ? query(collectionRef) 
        : query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions));
    
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as T);
        if (callback) callback(data);
    });
  }

  streamEntitiesChanges<T>(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions?: QueryOptions,
    callback?: (changes: { type: string; docData: T }[]) => void
  ) {
    const collectionRef = collection(db, collectionName);
    let q = queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0) 
        ? query(collectionRef) 
        : query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions));

    return onSnapshot(q, (snapshot) => {
        const changes = snapshot.docChanges().map((dc) => ({
            type: dc.type,
            docData: dc.doc.data() as T,
        }));
        if (callback) callback(changes);
    });
  }

  private constructQueryListRefMod(queryParams: QueryParams, queryOptions?: QueryOptions) {
    const queryArray: any[] = queryParams
      .filter((q) => q[2] !== undefined)
      .map((q) => {
        const [prop, comp, val] = q;
        return where(prop, comp, val);
      });

    if (queryOptions) {
      Object.keys(queryOptions).forEach((queryKey) => {
        switch (queryKey) {
          case 'orderBy': {
            if (Array.isArray(queryOptions.orderBy)) {
              queryArray.push(
                orderBy(queryOptions.orderBy[0], queryOptions.orderBy[1] as OrderByDirection),
              );
            } else {
              queryArray.push(orderBy(queryOptions.orderBy as string));
            }
            break;
          }
          case 'limit':
            queryArray.push(limit(queryOptions.limit as number));
            break;
          case 'startAt':
            queryArray.push(startAt(queryOptions.startAt));
            break;
          case 'startAfter':
            queryArray.push(startAfter(queryOptions.startAfter));
            break;
          case 'endAt':
            queryArray.push(endAt(queryOptions.endAt));
            break;
          case 'endBefore':
            queryArray.push(endBefore(queryOptions.endBefore));
            break;
          default:
            break;
        }
      });
    }
    return queryArray;
  }

  async getEntity<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, `${collectionName}/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as T;
    } else {
      return null;
    }
  }

  async getEntities<S>(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions?: QueryOptions,
  ): Promise<S[]> {
    const collectionRef = collection(db, collectionName);
    let q = queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0) 
        ? query(collectionRef) 
        : query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as S);
  }

  async count(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions?: QueryOptions,
  ): Promise<number> {
    const collectionRef = collection(db, collectionName);
    let q = queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0) 
        ? query(collectionRef) 
        : query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions));

    const querySnapshot = await getCountFromServer(q);
    return querySnapshot.data().count;
  }

  async aggregate<S extends { [k: string]: number }>(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions: QueryOptions,
    aggregateParams: { [K in keyof S]: [string] | [string, string] },
  ): Promise<{ [K in keyof S]: number }> {
    const collectionRef = collection(db, collectionName);

    const aggregateSpec: AggregateSpec = {};

    for (const key in aggregateParams) {
      if (aggregateParams[key][0] === 'count') {
        aggregateSpec[key] = count();
      } else if (aggregateParams[key][0] === 'sum') {
        aggregateSpec[key] = sum(aggregateParams[key][1] as string);
      } else if (aggregateParams[key][0] === 'average') {
        aggregateSpec[key] = average(aggregateParams[key][1] as string);
      }
    }

    let q = queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0) 
        ? query(collectionRef) 
        : query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions));

    const querySnapshot = await getAggregateFromServer(q, aggregateSpec);
    return querySnapshot.data() as any;
  }

  async addEntity(collectionName: string, entity: AnyEntity, batch?: WriteBatch) {
    const docRef = doc(db, `${collectionName}/${entity.__id}`);
    const entityFinal = Object.assign({}, entity, {
      _createdAt: serverTimestamp(),
      _updatedAt: serverTimestamp(),
      _deleted: false,
    });
    if (batch) {
      return batch.set(docRef, entityFinal);
    } else {
      return setDoc(docRef, entityFinal);
    }
  }

  async updateEntity(
    collectionName: string,
    id: string,
    changes: Partial<AnyEntity>,
    batch?: WriteBatch,
  ) {
    const docRef = doc(db, `${collectionName}/${id}`);
    const changesFinal = Object.assign({}, changes, {
      _updatedAt: serverTimestamp(),
    });
    if (batch) {
      return batch.update(docRef, changesFinal);
    } else {
      return updateDoc(docRef, changesFinal);
    }
  }

  async removeEntity(collectionName: string, id: string, batch?: WriteBatch) {
    const docRef = doc(db, `${collectionName}/${id}`);
    
    if (batch) {
      return batch.delete(docRef);
    } else {
      return deleteDoc(docRef);
    }
  }

  async incrementEntityField(collectionName: string, id: string, field: string, delta: number) {
    const docRef = doc(db, collectionName, id);
    const changes: any = {};
    changes[field] = increment(delta);

    return updateDoc(
      docRef,
      Object.assign({}, changes, {
        _updatedAt: serverTimestamp(),
      }),
    );
  }
}

export const dbService = new FirebaseService();
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export type Timestamp = FirebaseFirestoreTypes.Timestamp;

export type UserProfile = {
  name: string;
  title: string;
  bio: string;
  photoURL?: string;
  skills: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type Education = {
  id?: string;
  institution: string;
  degree: string;
  period: string;
};

export type Experience = {
  id?: string;
  title: string;
  company: string;
  period: string;
  description: string;
};

export type Project = {
  id?: string;
  title: string;
  description: string;
  tags: string[];
};

export type ApplicationStatus =
  | "Draft"
  | "In Progress"
  | "Submitted"
  | "Accepted"
  | "Rejected";

export type Application = {
  id?: string;
  name: string;
  deadline: string;
  status: ApplicationStatus;
  type: string;
  startDate?: string;
  endDate?: string;
  createdAt?: Timestamp;
};

export function userDoc(uid: string) {
  return firestore().collection("users").doc(uid);
}

export function educationCol(uid: string) {
  return userDoc(uid).collection("education");
}
export function experienceCol(uid: string) {
  return userDoc(uid).collection("experience");
}
export function projectsCol(uid: string) {
  return userDoc(uid).collection("projects");
}
export function applicationsCol(uid: string) {
  return userDoc(uid).collection("applications");
}

export const serverTimestamp = firestore.FieldValue.serverTimestamp;

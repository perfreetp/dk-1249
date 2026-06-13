import { useEffect } from 'react';
import { usePetStore, useCourseStore, useTrainingRecordStore, useBookingStore, useCheckInStore, useEvaluationStore, useMessageStore } from '../stores';
import { mockPets, mockCourses, mockTrainingRecords, mockBookings, mockCheckIns, mockEvaluations, mockMessages } from '../data/mockData';
import { storage } from '../utils/storage';

export function useInitializeData() {
  const { pets, currentPet, setCurrentPet, addPet } = usePetStore();
  const { courses, addCourse } = useCourseStore();
  const { records, addRecord } = useTrainingRecordStore();
  const { bookings, addBooking } = useBookingStore();
  const { checkIns, addCheckIn } = useCheckInStore();
  const { evaluations, addEvaluation } = useEvaluationStore();
  const { messages, addMessage } = useMessageStore();

  useEffect(() => {
    const isFirstVisit = storage.get('isFirstVisit', true);

    if (isFirstVisit) {
      if (pets.length === 0 && mockPets.length > 0) {
        mockPets.forEach(pet => addPet(pet));
      }

      if (courses.length === 0 && mockCourses.length > 0) {
        mockCourses.forEach(course => addCourse(course));
      }

      if (records.length === 0 && mockTrainingRecords.length > 0) {
        mockTrainingRecords.forEach(record => addRecord(record, false));
      }

      if (bookings.length === 0 && mockBookings.length > 0) {
        mockBookings.forEach(booking => addBooking(booking));
      }

      if (checkIns.length === 0 && mockCheckIns.length > 0) {
        mockCheckIns.forEach(checkIn => addCheckIn(checkIn));
      }

      if (evaluations.length === 0 && mockEvaluations.length > 0) {
        mockEvaluations.forEach(evaluation => addEvaluation(evaluation));
      }

      if (messages.length === 0 && mockMessages.length > 0) {
        mockMessages.forEach(message => addMessage(message));
      }

      if (pets.length > 0 || mockPets.length > 0) {
        const pet = pets.length > 0 ? pets[0] : mockPets[0];
        setCurrentPet(pet);
      }

      storage.set('isFirstVisit', false);
    }
  }, []);
}

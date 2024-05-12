export const calculateActualTimeInMinutes = (task: any): string => {
  const startTime = new Date(task.date + ' ' + task.startTime);
  const endTime = new Date(task.date + ' ' + task.endTime);

  const differenceInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

  return convertMinutesToTime(differenceInMinutes);
};

function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function convertMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60); // Round to nearest whole number for minutes
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export const calculateAverageTime = (timeEntries) => {
  let timesInMinutes = timeEntries.map((entry) => convertTimeToMinutes(entry.actualTime));

  if (timesInMinutes.length >= 5 && timesInMinutes.length < 10) {
    // If there are 5 or more but less than 10 entries, take the most recent 5
    timesInMinutes = timesInMinutes.slice(-5);
  } else if (timesInMinutes.length >= 10) {
    // If there are 10 or more entries, take the most recent 10
    timesInMinutes = timesInMinutes.slice(-10);
  } else {
    return;
  }

  // Sort the times to easily remove min and max
  timesInMinutes.sort((a, b) => a - b);

  // Remove the min and max values
  const valuesToCalculate = timesInMinutes.slice(1, -1);

  // Calculate the average
  const totalMinutes = valuesToCalculate.reduce((sum, time) => sum + time, 0);
  const averageMinutes = totalMinutes / valuesToCalculate.length;

  return convertMinutesToTime(averageMinutes);
};

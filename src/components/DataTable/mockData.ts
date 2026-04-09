import { Row } from './DataTable.types';

const firstNames = ['Alice','Bob','Carol','David','Emma','Frank','Grace','Henry','Isla','James','Karen','Liam','Mia','Noah','Olivia','Paul','Quinn','Rachel','Sam','Tara'];
const lastNames = ['Anderson','Brown','Clark','Davis','Evans','Foster','Garcia','Harris','Irving','Johnson','King','Lee','Martinez','Nelson','Patel','Rodriguez','Smith','Taylor','Vargas','Walker'];
const rolesByDepartment: Record<string, string[]> = {
  Engineering: ['Software Engineer','Senior Engineer','Staff Engineer','Tech Lead','Engineering Manager'],
  Design: ['UI Designer','UX Designer','Product Designer','Design Lead','Head of Design'],
  Product: ['Product Manager','Senior PM','Product Lead','Director of Product','VP of Product'],
  Marketing: ['Marketing Manager','Content Strategist','Growth Marketer','Brand Manager','CMO'],
  Sales: ['Account Executive','Sales Manager','BDR','Sales Lead','VP of Sales'],
};
const departments = Object.keys(rolesByDepartment);
const statuses: Row['status'][] = ['active','inactive','pending'];

function randomInt(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }
function randomItem<T>(arr: T[]): T { return arr[randomInt(0,arr.length-1)]; }
function randomDate(): string {
  const now = new Date();
  const past = new Date(now.getFullYear()-8,0,1).getTime();
  return new Date(randomInt(past,now.getTime())).toISOString().split('T')[0];
}

export function generateMockData(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => {
    const department = randomItem(departments);
    return {
      id: `row-${i+1}`,
      name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
      role: randomItem(rolesByDepartment[department]),
      department,
      salary: randomInt(40000, 150000),
      startDate: randomDate(),
      status: randomItem(statuses),
      rating: randomInt(1, 5),
    };
  });
}
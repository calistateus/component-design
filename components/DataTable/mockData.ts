import { Row } from './DataTable.types';

const firstNames = ['Alice','Bob','Carol','David','Emma','Frank','Grace','Henry','Isla','James','Karen','Liam','Mia','Noah','Olivia','Paul','Quinn','Rachel','Sam','Tara','Uma','Victor','Wendy','Xander','Yara','Zoe'];
const lastNames = ['Anderson','Brown','Clark','Davis','Evans','Foster','Garcia','Harris','Irving','Johnson','King','Lee','Martinez','Nelson',"O'Brien",'Patel','Quinn','Rodriguez','Smith','Taylor','Upton','Vargas','Walker','Xavier','Young','Zhang'];
const rolesByDepartment: Record<string, string[]> = {
  Engineering: ['Software Engineer','Senior Engineer','Staff Engineer','Tech Lead','Engineering Manager'],
  Design: ['UI Designer','UX Designer','Product Designer','Design Lead','Head of Design'],
  Product: ['Product Manager','Senior PM','Product Lead','Director of Product','VP of Product'],
  Marketing: ['Marketing Manager','Content Strategist','Growth Marketer','Brand Manager','CMO'],
  Sales: ['Account Executive','Sales Manager','BDR','Sales Lead','VP of Sales'],
};
const departments = Object.keys(rolesByDepartment);
const statuses: Array<Row['status']> = ['active','inactive','pending'];
function randomInt(min: number, max: number): number { return Math.floor(Math.random()*(max-min+1))+min; }
function randomItem<T>(arr: T[]): T { return arr[randomInt(0,arr.length-1)]; }
function randomISODate(yearsBack: number=10): string {
  const now = new Date();
  const past = new Date(now.getFullYear()-yearsBack,0,1).getTime();
  return new Date(randomInt(past,now.getTime())).toISOString().split('T')[0];
}
export function generateMockData(rowCount: number): Row[] {
  const rows: Row[] = [];
  for (let i=0;i<rowCount;i++) {
    const department = randomItem(departments);
    rows.push({ id: `row-${i+1}`, name: `${randomItem(firstNames)} ${randomItem(lastNames)}`, role: randomItem(rolesByDepartment[department]), department, salary: randomInt(40000,150000), startDate: randomISODate(8), status: randomItem(statuses), rating: randomInt(1,5), approved: Math.random()>0.4 });
  }
  return rows;
}
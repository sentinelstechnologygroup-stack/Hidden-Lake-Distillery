export const whitefishBottles = [
  {name:"Rum with Spices", category:"Rum"},
  {name:"River Rock Gin", category:"Gin"},
  {name:"Rock Creek Vodka", category:"Vodka"},
  {name:"Highline Rye", category:"Whiskey"},
  {name:"Wood’s Rose", category:"Specialty spirits"},
  {name:"Cranberry Moon", category:"Specialty spirits"},
  {name:"Flathead Sunrise", category:"Specialty spirits"},
  {name:"White Rum", category:"Rum"},
  {name:"Contraband Whiskey", category:"Whiskey"},
  {name:"Montequila Silver", category:"Specialty spirits"},
  {name:"Kintla Peak Gin", category:"Gin"},
  {name:"Huckleberry Reserve", category:"Specialty spirits"},
  {name:"Montequila Gold", category:"Specialty spirits"}
].map((bottle,index)=>({...bottle,image:"/images/whitefish/whitefish-"+index+".jpg"}));

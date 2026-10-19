import { Link, useParams } from "react-router-dom";
const data={
 privacy:["Privacy","This website preview stores trade and contact inquiries, including company, contact details, territory, message, and consent. Administrator accounts support inquiry review. Public shopping is disabled. No advertising tags have been enabled by this hardening pass. Hidden Lake Distillery is owned and operated by Table 62 LLC. Privacy questions may be sent to distillgrillchill@gmail.com. Detailed retention and provider information is under review before launch."],
 terms:["Terms","This website presents Hidden Lake Distillery and its brands for informational and trade inquiry purposes. No online sales, payments or stock reservations are offered. Product and territory availability and commercial terms are confirmed directly."],
 shipping:["Shipping & Pickup","This website does not accept orders or arrange shipping or pickup. Contact the distillery with product or trade questions."],
 returns:["Returns & Support","For support, contact distillgrillchill@gmail.com. This website does not process purchases or returns."],
 responsible:["Responsible Consumption","For adults 21 and older. Please drink responsibly. An entrance confirmation or self-reported birth date does not verify identity. Actual sales require the approved age and fulfillment verification process."]
};
export default function Policy(){
 const {section}=useParams();const item=data[section];
 return <main className="max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-6"><h1 className="font-display text-4xl">{item?.[0]||"Page not found"}</h1><p className="leading-relaxed">{item?.[1]||"This information page does not exist."}</p><p className="bg-yellow-200 text-black p-4">Review model — business policies require owner approval before public launch.</p><Link to="/contact" className="underline">Contact information</Link></main>;
}

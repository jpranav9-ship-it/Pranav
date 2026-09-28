const CONFIG={brand:"BOARDLY",whatsappNumber:"919999999999"};
document.querySelectorAll("[data-brand]").forEach(e=>e.textContent=CONFIG.brand);
const wa=message=>window.open("https://wa.me/"+CONFIG.whatsappNumber+"?text="+encodeURIComponent(message),"_blank");
document.querySelectorAll("[data-whatsapp]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();wa("Hi, I need a quote from BOARDLY. Please help me with my signage/printing requirement.");}));
document.querySelectorAll(".service-card").forEach(card=>card.addEventListener("click",()=>{
const value=card.dataset.service;
document.querySelector("#service").value=value==="Print"?"Flex Printing":value==="Event & Direction"?"Event Board":value==="Signage"?"Shop / Office Signage":"Repair / Cleaning";
document.querySelector("#quote").scrollIntoView({behavior:"smooth"});
}));
document.getElementById("quoteForm").addEventListener("submit",e=>{
e.preventDefault();
const g=id=>document.getElementById(id)?.value?.trim()||"Not specified";
const design=document.getElementById("design").checked?"Yes":"No";
const msg="Hi, I would like a quote from BOARDLY.\n\nService: "+g("service")+"\nSize: "+g("width")+" x "+g("height")+"\nQuantity: "+g("quantity")+"\nRequired: "+g("urgency")+"\nLocation: "+g("location")+"\nDesign/reference: "+design+"\nName: "+g("name")+"\nWhatsApp: "+g("phone")+"\nAdditional details: "+g("notes");
wa(msg);
});
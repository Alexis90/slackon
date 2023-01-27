import joinNs from "./joinNs.js";


const socket = io('http://localhost:5000');


socket.on('nsList',(data)=>{
	let namespacesDiv = document.querySelector('.namespaces')
	namespacesDiv.innerHTML =''
	data.forEach(ns=>{
		namespacesDiv.innerHTML += `<div class="namespace" data-ns="${ns.endpoint}"><img src="${ns.img}"></div>`
	})

	const topNs = data[0]
	joinNs(topNs.endpoint)

	Array.from(document.getElementsByClassName('namespace')).forEach(el=>{
		el.addEventListener('click',(e)=>{
			const nsEndpoint = el.dataset.ns
			joinNs(nsEndpoint)
		})
	})

})
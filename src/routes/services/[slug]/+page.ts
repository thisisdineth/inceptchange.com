import {error} from '@sveltejs/kit';import {services} from '$lib/data';
export function load({params}:{params:{slug:string}}){const service=services.find(s=>s.slug===params.slug);if(!service)error(404,'Service not found');return {service};}

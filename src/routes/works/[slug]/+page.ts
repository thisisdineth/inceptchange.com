import {error} from '@sveltejs/kit';import {works} from '$lib/data';
export function load({params}:{params:{slug:string}}){const work=works.find(w=>w.slug===params.slug);if(!work)error(404,'Project not found');return {work};}

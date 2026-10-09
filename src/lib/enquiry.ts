export const enquiryQuestions: Record<string, string> = {
 service: 'What kind of service are you looking for? Tell us a little about the story you want to capture.',
 date: 'What date do you have in mind? If you are still planning, “date undecided” is fine.',
 location: 'Where will your shoot or event take place? Share a venue or city, or let us help you choose.',
 time: 'What start time and approximate duration do you have in mind? Undecided is fine.',
 touches: 'Any final creative touches? Tell us your favourite shot types, camera angles, mood, reference links or must-have moments. You can also leave it to our team.'
};

export async function readEnquiryJSON(response: Response): Promise<{ error?: string; sent?: boolean; customerCopySent?: boolean }> {
 const fallback = 'We could not connect to the enquiry service. Your details are saved on this page; please retry.';
 if (!response.headers.get('content-type')?.includes('application/json')) throw new Error(fallback);
 try { return await response.json(); } catch { throw new Error(fallback); }
}

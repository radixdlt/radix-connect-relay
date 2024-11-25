export const getRequestBody = async (request: Request) => {
  try {
    return { data: await request.json() };
  } catch (error) {
    return { error };
  }
};

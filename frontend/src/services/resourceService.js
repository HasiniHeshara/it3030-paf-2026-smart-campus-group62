import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/resources";

export const addResource = async (resourceData) => {
  return await axios.post(API_BASE_URL, resourceData);
};

export const getAllResources = async () => {
  return await axios.get(API_BASE_URL);
};

export const searchResources = async (params) => {
  return await axios.get(`${API_BASE_URL}/search`, { params });
};
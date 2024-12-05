import haversineDistance from "../helper/NearbyHelper.js";
import Donor from "../Models/DonorModel.js";
import Informer from "../Models/InformerModel.js";
import NearByLocation from "../Models/NearbyModel.js";
import { validateToken } from "./DonorMeal.js";
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

const storeAllClosestInformers = async (req, res) => {
  const { uuid } = req.params;

  try {
    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;

    const donorMeal = await Donor.getDonorMealByUUID(uuid);
    if (!donorMeal) {
      return res.status(404).json({ success: false, message: 'Donor Meal not found.' });
    }

    const { latitude, longitude } = donorMeal;
    const informers = await Informer.getallInformer();

    if (!Array.isArray(informers)) {
      return res.status(500).json({ success: false, message: 'Error fetching informers.', informers });
    }

    const distances = informers.map(informer => ({
      ...informer,
      distance: haversineDistance(latitude, longitude, informer.latitude, informer.longitude),
    }));

    const closestInformers = distances
      .filter(informer => informer.distance <= 3)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    const closest_uuid = uuidv4();
    await NearByLocation.createClosestInformerTable();

    for (const informer of closestInformers) {
      await NearByLocation.storeClosestInformer({
        closest_uuid: closest_uuid,
        donor_uuid: uuid,
        informer_uuid: informer.uuid,
        distance: informer.distance,
        description: informer.description,
        imageurl: informer.imageurl,
        capture_date: moment().format('YYYY-MM-DD'),
        capture_time: informer.capture_time,
        count: informer.count,
        location: informer.location,
        latitude: informer.latitude,
        longitude: informer.longitude,
        status: informer.status,
      });
    }

    return res.status(201).json({ success: true, message: 'Closest informers stored successfully' });
  } catch (error) {
    console.error("Error storing closest informers:", error);
    return res.status(500).json({ success: false, message: 'An error occurred.', error: error.message });
  }
};

const getAllClosestInformers = async (req, res) => {
  const { donorUUID } = req.params;

  try {
    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;

    const closestInformers = await NearByLocation.getClosestInformersByDonorUUID(donorUUID);
    const today = moment().format('YYYY-MM-DD');
    const validInformers = [];

    for (const informer of closestInformers) {
      if (moment(informer.capture_date).isBefore(today)) {
        await NearByLocation.deleteClosestInformerByDonorUUID(donorUUID);
        console.log(`Deleted expired entry for informer UUID: ${donorUUID}`);
      } if (informer.status == 'delivered') {
        await NearByLocation.deleteClosestInformerByDonorUUID(donorUUID);
        console.log(`Deleted expired entry for informer UUID: ${donorUUID}`);
      } else {
        validInformers.push(informer);
      }
    }

    if (validInformers.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid informers found.' });
    }

    return res.status(200).json({ success: true, data: validInformers });
  } catch (error) {
    console.error('Error fetching closest informers:', error);
    return res.status(500).json({ success: false, message: 'An error occurred.', error: error.message });
  }
};


const getClosestInformersByClosestUUID = async (req, res) => {
  const { closestUUID } = req.params;

  try {
    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;

    const closestInformers = await NearByLocation.getClosestInformersByClosestUUID(closestUUID);
    const today = moment().format('YYYY-MM-DD');
    const validInformers = [];

    for (const informer of closestInformers) {
      if (moment(informer.capture_date).isBefore(today)) {
        await NearByLocation.deleteClosestInformerByclosestUUID(closestUUID);
        console.log(`Deleted expired entry for informer UUID: ${closestUUID}`);
      } if (informer.status == 'delivered') {
        await NearByLocation.deleteClosestInformerByclosestUUID(closestUUID);
        console.log(`Deleted expired entry for informer UUID: ${closestUUID}`);
      } else {
        validInformers.push(informer);
      }
    }

    if (validInformers.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid informers found.' });
    }

    return res.status(200).json({ success: true, data: validInformers });
  } catch (error) {
    console.error('Error fetching closest informers:', error);
    return res.status(500).json({ success: false, message: 'An error occurred.', error: error.message });
  }
};


const getAllClosestInformerByDonorUUIDAndInformerUUID = async (req, res) => {
  const { donorUUID, informerUUID } = req.params;

  try {
    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;
    const closestInformers = await NearByLocation.getAllClosestInformerByDonorUUIDAndInformerUUID(donorUUID, informerUUID);
    if (closestInformers.length === 0) {
      return res.status(404).send({ success: false, message: 'No closest informers found for this donor.' });
    }
    const today = moment().format('YYYY-MM-DD');
    const validInformers = [];
    for (const informer of closestInformers) {
      if (moment(informer.capture_date).isBefore(today)) {
        await NearByLocation.deleteClosestInformerByclosestUUID(donorUUID, informer.informer_uuid);
        console.log(`Deleted expired entry for informer UUID: ${informer.informer_uuid}`);
      } else {
        validInformers.push(informer);
      }
    }

    if (validInformers.length === 0) {
      return res.status(404).send({ success: false, message: 'No valid informers found for this donor.' });
    }

    return res.status(200).send({ success: true, data: validInformers });
  } catch (error) {
    console.error('Error fetching closest informers:', error);
    return res.status(500).send({ success: false, message: 'Error occurred while fetching closest informers', error: error.message });
  }
};

const updateClosestInformer = async (req, res) => {
  try {
    const { closest_uuid } = req.params;

    const decodedInformer = await validateToken(req, res);
    if (!decodedInformer) return;

    const fieldsToUpdate = {};
    const { distance, description, imageurl, capture_date, capture_time, count, location, latitude, longitude, status } = req.body;

    if (distance) fieldsToUpdate.distance = distance;
    if (description) fieldsToUpdate.description = description;
    if (imageurl) fieldsToUpdate.imageurl = imageurl;
    if (capture_date) fieldsToUpdate.capture_date = capture_date;
    if (capture_time) fieldsToUpdate.capture_time = capture_time;
    if (count) fieldsToUpdate.count = count;
    if (location) fieldsToUpdate.location = location;
    if (latitude) fieldsToUpdate.latitude = latitude;
    if (longitude) fieldsToUpdate.longitude = longitude;
    if (status) fieldsToUpdate.status = status;

    await NearByLocation.updateClosestInformer(closest_uuid, fieldsToUpdate);

    return res.status(200).send({ success: true, message: 'Informer updated successfully' });
  } catch (error) {
    console.error("Error updating Informer:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while updating Informer', error: error.message });
  }
};

export { storeAllClosestInformers, getAllClosestInformers, getAllClosestInformerByDonorUUIDAndInformerUUID, getClosestInformersByClosestUUID, updateClosestInformer };

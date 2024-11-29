import haversineDistance from "../helper/NearbyHelper.js";
import Donor from "../Models/DonorModel.js";
import Informer from "../Models/InformerModel.js";
import NearByLocation from "../Models/NearbyModel.js";
import { validateToken } from "./DonorMeal.js";
import moment from 'moment';

const storeallClosestInformers = async (req, res) => {
  const { uuid } = req.params;
  try {
    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;

    const donorMeal = await Donor.getDonorMealByUUID(uuid);
    if (!donorMeal) {
      return res.status(404).send({ success: false, message: 'Donor Meal not found.' });
    }

    const { latitude, longitude } = donorMeal;
    const informers = await Informer.getallInformer();
    if (!Array.isArray(informers)) {
      return res.status(500).send({ success: false, message: 'Error fetching informers: not an array', informers });
    }

    const distances = informers.map(informer => {
      const distance = haversineDistance(latitude, longitude, informer.latitude, informer.longitude);
      return { ...informer, distance };
    });

    const filteredInformers = distances.filter(informer => informer.distance <= 3);
    const closestInformers = filteredInformers.sort((a, b) => a.distance - b.distance).slice(0, 5);

    await NearByLocation.createClosestInformerTable();

    const formattedCaptureDate = moment().format('YYYY-MM-DD');

    for (const informer of closestInformers) {
      const existingEntry = await NearByLocation.findClosestInformer(
        uuid,
        informer.uuid,
        formattedCaptureDate,
        informer.location
      );

      if (existingEntry) {
        console.log(`Skipping duplicate entry for informer UUID ${informer.uuid} with same date, time, and location.`);
        continue;
      }


      await NearByLocation.storeClosestInformer(
        uuid,
        informer.uuid,
        informer.distance,
        informer.description,
        informer.imageurl,
        formattedCaptureDate,
        informer.capture_time,
        informer.count,
        informer.location,
        informer.latitude,
        informer.longitude,
        informer.status
      );
    }

    return res.status(201).send({ success: true, message: 'Closest informers stored successfully' });
  } catch (error) {
    console.error("Error storing closest informers:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while storing closest informers', error: error.message });
  }
};

const getAllClosestInformer = async (req, res) => {
  const { donorUUID } = req.params;

  try {
    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;
    const closestInformers = await NearByLocation.getClosestInformersByDonorUUID(donorUUID);
    if (closestInformers.length === 0) {
      return res.status(404).send({ success: false, message: 'No closest informers found for this donor.' });
    }
    const today = moment().format('YYYY-MM-DD');
    const validInformers = [];
    for (const informer of closestInformers) {
      if (moment(informer.capture_date).isBefore(today)) {
        await NearByLocation.deleteClosestInformerByUUID(donorUUID, informer.informer_uuid);
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

const getAllClosestInformerByDonorUUIDAndInformerUUID = async (req, res) => {
  const { donorUUID, informerUUID } = req.params;

  try {
    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;
    const closestInformers = await NearByLocation.getClosestInformersByDonorUUIDAndInformerUUID(donorUUID, informerUUID);
    if (closestInformers.length === 0) {
      return res.status(404).send({ success: false, message: 'No closest informers found for this donor.' });
    }
    const today = moment().format('YYYY-MM-DD');
    const validInformers = [];
    for (const informer of closestInformers) {
      if (moment(informer.capture_date).isBefore(today)) {
        await NearByLocation.deleteClosestInformerByUUID(donorUUID, informer.informer_uuid);
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
    const { donor_uuid, informer_uuid } = req.params;

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

    await NearByLocation.updateClosestInformer(donor_uuid, informer_uuid, fieldsToUpdate);

    return res.status(200).send({ success: true, message: 'Informer updated successfully' });
  } catch (error) {
    console.error("Error updating Informer:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while updating Informer', error: error.message });
  }
};

export { storeallClosestInformers, getAllClosestInformer, getAllClosestInformerByDonorUUIDAndInformerUUID, updateClosestInformer };

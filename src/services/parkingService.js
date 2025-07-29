let isParkingActive = true;

export const fetchParkingStatus = async () => {
    console.log("Consultando estado del estacionamiento...");
    console.log("Estado actual:", isParkingActive);
    return isParkingActive;
};

export const toggleParkingStatus = async () => {
    console.log("Cambiando estado del estacionamiento...");
    await new Promise(resolve => setTimeout(resolve, 800));
    isParkingActive = !isParkingActive;
    console.log('Nuevo estado:', isParkingActive);
    return isParkingActive;
};

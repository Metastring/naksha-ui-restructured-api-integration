import { Box, Text } from "@chakra-ui/core";
import React, { useState, useEffect } from "react";
import { emit } from "react-gbus";
import _ from "underscore";
import MapGL, { Popup } from "react-map-gl";

// import useDebounce from "../../hooks/use-debounce";
import useLayerManager from "../../hooks/use-layer-manager";
import { useLayers } from "../../hooks/use-layers";
import { defaultMapStyles } from "../../static/constants";
import InfoBar from "./infobar";
import Legend from "./legend";
import MarkersList from "./markers-list";
import Navigation from "./navigation";
// import Popup from "./popup";
import Sidebar from "./sidebar";

export default function Map({ externalLayers }: { externalLayers? }) {
  const {
    mapRef,
    loadToC,
    showToC,
    mapboxApiAccessToken,
    viewPort,
    setViewPort,
    baseLayer,
    layers,
    infobarData
  } = useLayers();
  const { toggleExternalLayer } = useLayerManager();
  const {
    updateWorldView,
    reloadLayers,
    onMapClick,
    renderHLData
  } = useLayerManager();

  // const debouncedViewPort = useDebounce(viewPort, 500);

  // useListener(reloadLayers, ["STYLE_UPDATED"]);
  // const [currentExternalLayer, setCurrentExternalLayer] = useState(false);
  const [addedLayers, setAddedLayers] = useState([]);
  const [popUp, setPopUp] = useState(null);

  const onLoad = () => {
    updateWorldView();
    mapRef.current.getMap().on("style.load", () => {
      updateWorldView();
      emit("STYLE_UPDATED");
    });
  };

  const toggleExternalLayers = async () => {
    await _.each(addedLayers, layer => {
      toggleExternalLayer(layer.id, layer.styles, false);
    });

    await _.each(externalLayers, layer => {
      toggleExternalLayer(layer.id, layer.styles, true);
    });
    setAddedLayers(externalLayers);
  };

  useEffect(() => {
    console.log('externalLayers', externalLayers);
    if ((externalLayers && externalLayers.length > 0) || addedLayers.length > 0)
      toggleExternalLayers();
  }, [JSON.stringify(externalLayers)]);

  useEffect(() => {
    reloadLayers();
  }, [layers.length]);

  // useEffect(() => {
  //   reloadLayers(true);
  // }, [debouncedViewPort]);

  useEffect(() => {
    renderHLData();
  }, [infobarData]);

  const handleHover = e => {
    if (
      e.features &&
      e.features.length &&
      e.features[0].layer &&
      e.features[0].layer.id
    ) {
      const extLayer = _.findWhere(externalLayers, {
        id: e.features[0].layer.id
      });
      const description = e.features[0].properties;
      let colorBy = false;
      if (_.has(description, "new_distt") || _.has(description, "state")) {
        colorBy = _.has(description, "new_distt") ? description.new_distt : description.state;
      }

      if (
        colorBy &&
        extLayer &&
        extLayer.properties &&
        e.features &&
        e.features.length &&
        e.features[0].properties
      ) {
        if(!extLayer.properties[colorBy]) return setPopUp(null);
        const selectedProp = extLayer.properties[colorBy][0];
        const popUpProps = {
          Value: selectedProp.value,
          Type: selectedProp["entity.type"]
        };
        if (selectedProp["entity.type"] === "DISTRICT")
          popUpProps['State'] = selectedProp["entity.State"];
        setPopUp({
          coordinates: e.lngLat,
          title: colorBy,
          properties: popUpProps
        });
      } else {
        return setPopUp(null);
      }
    } else {
      return setPopUp(null);
    }
  };

  return (
    <Box size="full" position="relative">
      <MapGL
        {...viewPort}
        width="100%"
        height="100%"
        mapStyle={defaultMapStyles[baseLayer].style}
        onLoad={onLoad}
        ref={mapRef}
        getCursor={() => "default"}
        onViewportChange={setViewPort}
        mapboxApiAccessToken={mapboxApiAccessToken}
        onClick={onMapClick}
        onHover={handleHover}
      >
        <Navigation onViewportChange={setViewPort} />
        <Legend />
        {/* {clickPopup && <Popup data={clickPopup} set={setClickPopup} />}
        {!clickPopup && hoverPopup && (
          <Popup data={hoverPopup} set={setHoverPopup} closeButton={false} />
        )} */}
        {!_.isEmpty(popUp) && (
          <Popup
            longitude={popUp.coordinates[0]}
            latitude={popUp.coordinates[1]}
            closeButton={false}
            closeOnClick={false}
          >
            <Box>
              <Text fontWeight="bold">
                {popUp.title}
              </Text>
              {_.map(popUp.properties, (p, key) => (
                <Box className="pop-up-props" fontSize="12px">
                  {key}: <span style={{ fontWeight: "bold" }}>{p}</span>
                </Box>
              ))}
            </Box>
          </Popup>
        )}
        <MarkersList />
      </MapGL>
      {loadToC && <Sidebar showTOC={showToC}/>}
      {infobarData.length > 0 && <InfoBar />}
    </Box>
  );
}

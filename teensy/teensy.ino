//http://forum.arduino.cc/index.php?topic=396450.0


#include <OctoWS2811.h>

const int ledsPerStrip = 144  ;

DMAMEM int displayMemory[ledsPerStrip*6];
int drawingMemory[ledsPerStrip*6];

const int config = WS2811_GRB | WS2811_800kHz;

OctoWS2811 leds(ledsPerStrip, displayMemory, drawingMemory, config);







const byte numBytes = 32;
byte receivedBytes[numBytes];
byte numReceived = 0;

boolean newData = false;

void setup() {
  leds.begin();
  leds.show();
  
  Serial.begin(9600);
  Serial.println("<Arduino is ready>");
}

void loop() {
  recvBytesWithStartEndMarkers();
  handleNewData();
}

void recvBytesWithStartEndMarkers() {
    static boolean recvInProgress = false;
    static byte ndx = 0;
    byte startMarker = 0x3C;
    byte endMarker = 0x3E;
    byte rb;
   

    while (Serial.available() > 0 && newData == false) {
        rb = Serial.read();

        if (recvInProgress == true) {
            if (rb != endMarker) {
                receivedBytes[ndx] = rb;
                ndx++;
                if (ndx >= numBytes) {
                    ndx = numBytes - 1;
                }
            }
            else {
                receivedBytes[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                numReceived = ndx;  // save the number for use when printing
                ndx = 0;
                newData = true;
            }
        }

        else if (rb == startMarker) {
            recvInProgress = true;
        }
    }
}

void handleNewData() {
    if (newData == true) {
        long value;
 value = receivedBytes[0];
/*
        value = (long)receivedBytes[0] << 24;
        value += (long)receivedBytes[1] << 16;
        value += (long)receivedBytes[2] << 8;
        value += (long)receivedBytes[3];
  */
        Serial.print(value); //pixel position

        Serial.print(receivedBytes[4]); //R
        Serial.print(receivedBytes[5]); //G
        Serial.print(receivedBytes[6]); //B

        leds.setPixel(value, receivedBytes[4], receivedBytes[5], receivedBytes[6]);
        leds.show();
  
        newData = false;
    }
}

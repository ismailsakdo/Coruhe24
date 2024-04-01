#include "Adafruit_PM25AQI.h"
#include <Adafruit_Sensor.h>
#include "DHT.h"

#include <SoftwareSerial.h>
SoftwareSerial pmSerial(16, 17);
#define DHTPIN 23 

Adafruit_PM25AQI aqi = Adafruit_PM25AQI();
#define DHTTYPE    DHT11
DHT dht(DHTPIN, DHTTYPE);

//variable name
int pm1std; int pm25std; int pm10std; float temp; float humid;


void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Serial.println("Adafruit PMSA003I Air Quality Sensor");
  delay(1000);
  pmSerial.begin(9600);
  if (! aqi.begin_UART(&pmSerial)) { // connect to the sensor over software serial 
    Serial.println("Could not find PM 2.5 sensor!");
    while (1) delay(10);
  }

  Serial.println("PM25 found!");
  
  // DHT
  dht.begin();
}

void loop() {
  PM25_AQI_Data data;  
  if (! aqi.read(&data)) {
    Serial.println("Could not read from AQI");
    delay(500);  // try again in a bit!
    return;
  }

  //Name baru
  int pm1std = data.pm10_standard;
  int pm25std= data.pm25_standard;
  int pm10std = data.pm100_standard;
  
  Serial.println("AQI reading success");
  Serial.println();
  Serial.println(F("---------------------------------------"));
  Serial.println(F("Concentration Units (standard)"));
  Serial.println(F("---------------------------------------"));
  Serial.print(F("PM 1.0: ")); Serial.print(pm1std);
  Serial.print(F("\t\tPM 2.5: ")); Serial.print(pm25std);
  Serial.print(F("\t\tPM 10: ")); Serial.println(pm10std);
  Serial.println(F("Concentration Units (environmental)"));
  Serial.println(F("---------------------------------------"));
  Serial.print(F("PM 1.0: ")); Serial.print(data.pm10_env);
  Serial.print(F("\t\tPM 2.5: ")); Serial.print(data.pm25_env);
  Serial.print(F("\t\tPM 10: ")); Serial.println(data.pm100_env);
  Serial.println(F("---------------------------------------"));
  Serial.print(F("Particles > 0.3um / 0.1L air:")); Serial.println(data.particles_03um);
  Serial.print(F("Particles > 0.5um / 0.1L air:")); Serial.println(data.particles_05um);
  Serial.print(F("Particles > 1.0um / 0.1L air:")); Serial.println(data.particles_10um);
  Serial.print(F("Particles > 2.5um / 0.1L air:")); Serial.println(data.particles_25um);
  Serial.print(F("Particles > 5.0um / 0.1L air:")); Serial.println(data.particles_50um);
  Serial.print(F("Particles > 10 um / 0.1L air:")); Serial.println(data.particles_100um);
  Serial.println(F("---------------------------------------"));  
  delay(500);

  //DHT11
  float humid = dht.readHumidity();
  float temp = dht.readTemperature();
  
  // Check if any reads failed and exit early (to try again).
  if (isnan(humid) || isnan(temp)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }
  Serial.print("Humidity: ");
  Serial.print(humid);
  Serial.print(" Temperature: ");
  Serial.println(temp);
  delay(1000);
}

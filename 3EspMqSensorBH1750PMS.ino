//Include the library
#include <MQUnifiedsensor.h>
#include <BH1750.h>
#include <Wire.h>
#include "Adafruit_PM25AQI.h"
#include <SoftwareSerial.h>

//Definitions
#define placa "ESP32"
#define Voltage_Resolution 3.3
#define pin 34 //Analog input 0 of your arduino
#define type "MQ-135" //MQ135
#define ADC_Bit_Resolution 12 // For arduino UNO/MEGA/NANO
#define RatioMQ135CleanAir 3.6//RS / R0 = 3.6 ppm  

//Declare Sensor
MQUnifiedsensor MQ135(placa, Voltage_Resolution, ADC_Bit_Resolution, pin, type);
BH1750 lightMeter;
SoftwareSerial pmSerial(16, 17);

//Initialize
Adafruit_PM25AQI aqi = Adafruit_PM25AQI();

//variable
  int pm1;
  int pm25;
  int particle03; 
  int particle05;
  int particle10;

void setup() {
  Serial.begin(115200); //Init serial port
  MQ135.setRegressionMethod(1); //_PPM =  a*ratio^b 
  MQ135.init(); 
  Serial.print("Calibrating please wait.");
  float calcR0 = 0;
  for(int i = 1; i<=10; i ++)
  {
    MQ135.update(); // Update data, the arduino will read the voltage from the analog pin
    calcR0 += MQ135.calibrate(RatioMQ135CleanAir);
    Serial.print(".");
  }
  MQ135.setR0(calcR0/10);
  Serial.println("  done!.");
  
  if(isinf(calcR0)) {Serial.println("Warning: Conection issue, R0 is infinite (Open circuit detected) please check your wiring and supply"); while(1);}
  if(calcR0 == 0){Serial.println("Warning: Conection issue found, R0 is zero (Analog pin shorts to ground) please check your wiring and supply"); while(1);}
  /*****************************  MQ CAlibration ********************************************/ 
  Serial.println("** Values from MQ-135 ****");
  Serial.println("|    CO   |  Alcohol |   CO2  |  Toluen  |  NH4  |  Aceton  |");

  //Light
  Wire.begin();
  lightMeter.begin();
  Serial.println(F("BH1750 Test begin"));

  //PMS
  while (!Serial) delay(10);
  Serial.println("Adafruit PMSA003I Air Quality Sensor");
  delay(1000);
  pmSerial.begin(9600);
  if (! aqi.begin_UART(&pmSerial)) { // connect to the sensor over software serial 
    Serial.println("Could not find PM 2.5 sensor!");
    while (1) delay(10);
  }

  Serial.println("PM25 found!");  
}

void loop() {
  //MQ Sensor
  MQ135.update(); // Update data, the arduino will read the voltage from the analog pin
  MQ135.setA(605.18); MQ135.setB(-3.937); // Configure the equation to calculate CO concentration value
  float CO = MQ135.readSensor(); // Sensor will read PPM concentration using the model, a and b values set previously or from the setup
  Serial.print("Bacaan CO:   ");
  Serial.print(CO);

  //Light meter reading
  float lux = lightMeter.readLightLevel();
  Serial.print(" Light: ");
  Serial.print(lux);
  Serial.println(" lx");

  //PMS Sensor
  PM25_AQI_Data data;
  
  if (! aqi.read(&data)) {
    Serial.println("Could not read from AQI");
    delay(500);  // try again in a bit!
    return;
  }
  Serial.println("AQI reading success");

  //PMS Parameter
  int pm1 = data.pm10_env;
  int pm25 = data.pm25_env;
  int particle03 = data.particles_03um;
  int particle05 = data.particles_05um;
  int particle10 = data.particles_100um; //PM10

  Serial.print("PM1: ");
  Serial.print(pm1);
  Serial.print(" PM2.5: ");
  Serial.print(pm25);
  Serial.print(" Particle 0.3: ");
  Serial.print(particle03);
  Serial.print(" Particle 0.5: ");
  Serial.print(particle05);
  Serial.print(" Particle 10: ");
  Serial.println(particle10);

  delay(1000);
}

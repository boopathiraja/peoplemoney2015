package com.capitalone.share360.shared;
import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.json.JettisonMappedXmlDriver;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class test {

	public static void main(String[] args) {
		System.out.println("ok");
		writeFile();
	}
	
	
	public static void writeFile(){

		
		
		
				transactions trans = new transactions();
				trans.setAccount_id("123");
		        XStream xstream = new XStream(new JettisonMappedXmlDriver());
		        xstream.setMode(XStream.NO_REFERENCES);
		        xstream.alias("transactions", transactions.class);
		        System.out.println(xstream.toXML(trans));		
				

		}
	}
	


package com.rideloop.userservice.college.config;

import com.rideloop.userservice.college.entity.College;
import com.rideloop.userservice.college.repository.CollegeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CollegeSeeder implements CommandLineRunner {

    private final CollegeRepository collegeRepository;

    @Override
    public void run(String... args) {
        // 1. VRSEC
        seedOrUpdateCollege(
                "Velagapudi Ramakrishna Siddhartha Engineering College",
                "VRSEC",
                "vrsec.ac.in",
                "Kanuru, Vijayawada, Andhra Pradesh 520007",
                "Vijayawada",
                "Andhra Pradesh",
                "India",
                16.4839,
                80.6937
        );

        // 2. PVPSIT
        seedOrUpdateCollege(
                "Prasad V. Potluri Siddhartha Institute of Technology",
                "PVPSIT",
                "pvpsiddhartha.ac.in",
                "Kanuru, Vijayawada, Andhra Pradesh 520007",
                "Vijayawada",
                "Andhra Pradesh",
                "India",
                16.4886,
                80.6974
        );

        // 3. KLU
        seedOrUpdateCollege(
                "KL Deemed to be University",
                "KLU",
                "kluniversity.in",
                "Green Fields, Vaddeswaram, Guntur District, Andhra Pradesh 522502",
                "Vaddeswaram",
                "Andhra Pradesh",
                "India",
                16.4422,
                80.6225
        );

        // 4. VIT-AP
        seedOrUpdateCollege(
                "VIT-AP University",
                "VIT-AP",
                "vitap.ac.in",
                "Inavolu, Beside AP Secretariat, Amaravati, Andhra Pradesh 522237",
                "Amaravati",
                "Andhra Pradesh",
                "India",
                16.4971,
                80.5002
        );

        // 5. SRM-AP
        seedOrUpdateCollege(
                "SRM University-AP",
                "SRM-AP",
                "srmap.edu.in",
                "Neerukonda, Mangalagiri Mandal, Amaravati, Andhra Pradesh 522240",
                "Amaravati",
                "Andhra Pradesh",
                "India",
                16.4649,
                80.5081
        );

        // 6. ALIET
        seedOrUpdateCollege(
                "Andhra Loyola Institute of Engineering and Technology",
                "ALIET",
                "aliet.ac.in",
                "Polytechnic Post Office, Beside Vinayaka Theatre, Benz Circle, Vijayawada, Andhra Pradesh 520008",
                "Vijayawada",
                "Andhra Pradesh",
                "India",
                16.5028,
                80.6558
        );

        // 7. SRKIT
        seedOrUpdateCollege(
                "SRK Institute of Technology",
                "SRKIT",
                "srkit.in",
                "NH-16, Enikepadu, Vijayawada, Andhra Pradesh 521108",
                "Vijayawada",
                "Andhra Pradesh",
                "India",
                16.5298,
                80.6972
        );

        // 8. PSCMR
        seedOrUpdateCollege(
                "Potti Sriramulu Chalavadi Mallikarjuna Rao College of Engineering and Technology",
                "PSCMR",
                "pscmr.ac.in",
                "Raghavareddy Street, Kothapet, Vijayawada, Andhra Pradesh 520001",
                "Vijayawada",
                "Andhra Pradesh",
                "India",
                16.5204,
                80.6128
        );

        // 9. DIET
        seedOrUpdateCollege(
                "Dhanekula Institute of Engineering and Technology",
                "DIET",
                "diet.ac.in",
                "Ganguru, Vijayawada, Andhra Pradesh 521139",
                "Ganguru",
                "Andhra Pradesh",
                "India",
                16.4716,
                80.7303
        );

        // 10. NRIIT
        seedOrUpdateCollege(
                "NRI Institute of Technology",
                "NRIIT",
                "nriit.edu.in",
                "Pothavarappadu, Agiripalli Mandal, Vijayawada Rural, Andhra Pradesh 521212",
                "Agiripalli",
                "Andhra Pradesh",
                "India",
                16.6669,
                80.7719
        );
    }

    private void seedOrUpdateCollege(
            String name,
            String shortName,
            String emailDomain,
            String address,
            String city,
            String state,
            String country,
            Double latitude,
            Double longitude
    ) {
        College college = collegeRepository.findByEmailDomain(emailDomain)
                .orElse(null);

        if (college == null) {
            college = College.builder()
                    .name(name)
                    .shortName(shortName)
                    .emailDomain(emailDomain)
                    .address(address)
                    .city(city)
                    .state(state)
                    .country(country)
                    .latitude(latitude)
                    .longitude(longitude)
                    .active(true)
                    .build();
        } else {
            college.setName(name);
            college.setShortName(shortName);
            college.setAddress(address);
            college.setCity(city);
            college.setState(state);
            college.setCountry(country);
            college.setLatitude(latitude);
            college.setLongitude(longitude);
            college.setActive(true);
        }

        collegeRepository.save(college);
    }
}
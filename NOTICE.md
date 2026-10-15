# Data notice

`data/DE-BY-municipalities.json` contains a derived mapping of Bavarian
municipalities used to select the local rules for Assumption Day and the Augsburg
Peace Festival.

Source: Bayerisches Landesamt für Statistik, "Mariä Himmelfahrt" municipality
database:

<https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/>

The mapping is based on the 2022 census and has applied since 2025. The source
URL and generation timestamp are also recorded inside the generated JSON file.
The source is checked monthly against the bundled mapping. Because the authority
publishes an HTML database rather than a versioned API, the importer requires all
2,056 unique and structurally valid municipality records before it accepts a
download. A detected difference requires review and a new module release; the
running module never overwrites this legal mapping silently.

The project code is distributed under the MIT license. Third-party dependencies
and source data remain subject to their respective terms.

const VALIDRATING = ["U", "PG", "12", "15", "18"]
const DURATION = /^(\d?\d):(\d\d)$/
const ExceededMaxCapacity = 'Exceeded max capacity'
const ScreenAlreadyExists = 'Screen already exists'
const FilmAlreadyExists = 'Film already exists'
const InvalidDuration = 'Invalid duration'
const InvalidRating = 'Invalid rating'
const InvalidStartTime = 'Invalid start time'
const InvalidEndTime = 'Invalid end time'
const InvalidFilm = 'Invalid film'
const InvalidScreen = 'InvalidScreen'
const TimeUnavailable = 'Time unavailable'


class Cinema {


  constructor() {
    this.films = []
    this.screens = []
  }

  //Add a new screen
  newScreen(screenName, capacity) {
    if (capacity > 100) {
      return ExceededMaxCapacity
    }
    let screen = this.checkScreen(screenName)
    // own class?
    this.screens.push({
      name: screenName,
      capacity: capacity,
      showings: []
    })
    return screen
  }

  checkScreen(screenName) {
    //Check the screen doesn't already exist
    let screen = null
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i].name === screenName) {
        screen = this.screens[i]
      }
    }
    if (screen != null) {
      return ScreenAlreadyExists
    }
  }

  //Add a new film
  addNewFilm(filmName, rating, duration) {
    if (this.checkFilm(filmName) && this.checkRating(rating) && this.checkDuration(duration)) {

       this.films.push({ name: filmName, rating: rating, duration: duration })
    } return this.films
  }

  checkFilm(filmName) {
    let movie = null
    for (let i = 0; i < this.films.length; i++) {
      if (this.films[i].name === filmName) {
        movie = this.films[i]
      }
    }
    if (movie != null) {
      return FilmAlreadyExists
    }
  }

  checkDuration(duration) {
    const result = DURATION.exec(duration)
    if (result == null) {
      return InvalidDuration
    }
    const hours = parseInt(result[1])
    const mins = parseInt(result[2])
    if (hours <= 0 || mins > 60) {
      return InvalidDuration
    }
  }

  checkRating(rating) {

   if (rating!="U" && rating!="PG") {
    if (rating!="12" && rating!="15" && rating!="18") {
      return InvalidRating
    }
  }
}


  //Add a showing for a specific film to a screen at the provided start time
  // rename method
  addFilm(movie, screenName, startTime) {

    let result = DURATION.exec(startTime)
    if (result == null) {
      return InvalidStartTime
    }

    const intendedStartTimeHours = parseInt(result[1])
    const intendedStartTimeMinutes = parseInt(result[2])
    if (intendedStartTimeHours <= 0 || intendedStartTimeMinutes > 60) {
      return InvalidStartTime
    }

    // find film method
    let film = null
    //Find the film by name
    for (let i = 0; i < this.films.length; i++) {
      if (this.films[i].name == movie) {
        film = this.films[i]
      }
    }

    if (film === null) {
      return InvalidFilm
    }

    //From duration, work out intended end time
    //if end time is over midnight, it's an error
    //Check duration
    result = DURATION.exec(film.duration)
    if (result == null) {
      return InvalidDuration
    }

    const durationHours = parseInt(result[1])
    const durationMins = parseInt(result[2])

    //Add the running time to the duration
    let intendedEndTimeHours = intendedStartTimeHours + durationHours

    //It takes 20 minutes to clean the screen so add on 20 minutes to the duration 
    //when working out the end time
    let intendedEndTimeMinutes = intendedStartTimeMinutes + durationMins + 20
    if (intendedEndTimeMinutes >= 60) {
      intendedEndTimeHours += Math.floor(intendedEndTimeMinutes / 60)
      intendedEndTimeMinutes = intendedEndTimeMinutes % 60
    }

    if (intendedEndTimeHours >= 24) {
      //test expecting extra string
      return InvalidStartTime 

    }

    //Find the screen by name
    // move into own method
    let theatre = null
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i].name == screenName) {
        theatre = this.screens[i]
      }
    }

    if (theatre === null) {
      return InvalidScreen
    }

    //Go through all existing showings for this film and make
    //sure the start time does not overlap 
    let error = false
    for (let i = 0; i < theatre.showings.length; i++) {

      //Get the start time in hours and minutes
      const startTime = theatre.showings[i].startTime
      result = DURATION.exec(startTime)
      if (result == null) {
        return InvalidStartTime
      }

      const startTimeHours = parseInt(result[1])
      const startTimeMins = parseInt(result[2])
      if (startTimeHours <= 0 || startTimeMins > 60) {
        return InvalidStartTime
      }

      //Get the end time in hours and minutes
      const endTime = theatre.showings[i].endTime
      result = DURATION.exec(endTime)
      if (result == null) {
        return InvalidEndTime
      }

      const endTimeHours = parseInt(result[1])
      const endTimeMins = parseInt(result[2])
      if (endTimeHours <= 0 || endTimeMins > 60) {
        return InvalidEndTime
      }

      //if intended start time is between start and end
      const d1 = new Date()
      d1.setMilliseconds(0)
      d1.setSeconds(0)
      d1.setMinutes(intendedStartTimeMinutes)
      d1.setHours(intendedStartTimeHours)

      const d2 = new Date()
      d2.setMilliseconds(0)
      d2.setSeconds(0)
      d2.setMinutes(intendedEndTimeMinutes)
      d2.setHours(intendedEndTimeHours)

      const d3 = new Date()
      d3.setMilliseconds(0)
      d3.setSeconds(0)
      d3.setMinutes(startTimeMins)
      d3.setHours(startTimeHours)

      const d4 = new Date()
      d4.setMilliseconds(0)
      d4.setSeconds(0)
      d4.setMinutes(endTimeMins)
      d4.setHours(endTimeHours)

      if ((d1 > d3 && d1 < d4) || (d2 > d3 && d2 < d4) || (d1 < d3 && d2 > d4)) {
        error = true
        break
      }
    }

    if (error) {
      return TimeUnavailable
    }

    //Add the new start time and end time to the showing
    theatre.showings.push({
      film: film,
      startTime: startTime,
      endTime: intendedEndTimeHours + ":" + intendedEndTimeMinutes
    })
  }

  allShowings() {
    let showings = {}
    for (let i = 0; i < this.screens.length; i++) {
      const screen = this.screens[i]
      for (let j = 0; j < screen.showings.length; j++) {
        const showing = screen.showings[j]
        if (!showings[showing.film.name]) {
          showings[showing.film.name] = []
        }
        showings[showing.film.name].push(`${screen.name} ${showing.film.name} (${showing.film.rating}) ${showing.startTime} - ${showing.endTime}`)
      }
    }

    return showings
  }
}

module.exports = Cinema